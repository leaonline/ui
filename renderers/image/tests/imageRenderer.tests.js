import { expect } from 'chai'
import { createRendererTestContext } from '../../../tests/rendererHelpers.tests'
import '../imageRenderer'
import { createFakeIntersectionObserverTests } from '../../../tests/createFakeIntersectionObserver.tests'

describe('imageRenderer', () => {
  const { render, setup, teardown, sandbox } = createRendererTestContext()
  beforeEach(() => setup())
  afterEach(() => teardown())

  it('delegates lazy loading and accessibility attributes to the image component', async () => {
    const { observers, FakeIntersectionObserver } =
      createFakeIntersectionObserverTests()
    globalThis.IntersectionObserver = FakeIntersectionObserver

    const root = await render('imageRenderer', {
      value: 'https://example.test/image.png',
    })
    const observer = observers[0]
    const image = root.querySelector('img')

    expect(image.classList.contains('lea-image')).to.equal(true)
    expect(image.classList.contains('img-fluid')).to.equal(true)
    expect(image.alt).to.equal('translated:image.alt')
    expect(image.getAttribute('crossorigin')).to.equal('Anonymous')
    expect(image.getAttribute('data-src')).to.equal(
      'https://example.test/image.png',
    )
    expect(image.hasAttribute('src')).to.equal(false)
    expect(observer.observed).to.deep.equal([image])

    observer.callback([{ isIntersecting: false, target: image }], observer)
    expect(image.hasAttribute('src')).to.equal(false)

    observer.callback([{ isIntersecting: true, target: image }], observer)
    expect(image.getAttribute('src')).to.equal('https://example.test/image.png')
    expect(observer.unobserved).to.deep.equal([image])

    teardown()
    expect(observer.disconnectCalls).to.equal(1)
  })
})
