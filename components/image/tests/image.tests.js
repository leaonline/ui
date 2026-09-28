/* eslint-env mocha */
import { expect } from 'chai'
import { createTemplateRenderingContext } from '../../../tests/blazeHelpers.tests'
import { createFakeIntersectionObserverTests } from '../../../tests/createFakeIntersectionObserver.tests'
import '../image'

describe('image', () => {
  const { render, setup, teardown, afterFlush } =
    createTemplateRenderingContext()
  beforeEach(() => setup())
  afterEach(() => teardown())

  it('lazy-loads an intersecting image and disconnects on removal', async () => {
    const { observers, FakeIntersectionObserver } =
      createFakeIntersectionObserverTests()
    globalThis.IntersectionObserver = FakeIntersectionObserver

    const root = await render('image', {
      src: 'https://example.test/lazy.png',
      title: 'Lazy image',
      alt: 'A lazy-loaded example',
    })
    const image = root.querySelector('img.lea-image')
    const observer = observers[0]

    expect(observers).to.have.length(1)
    expect(observer.observed).to.deep.equal([image])
    expect(image.hasAttribute('src')).to.equal(false)

    observer.callback([{ isIntersecting: true, target: image }], observer)

    expect(image.getAttribute('src')).to.equal('https://example.test/lazy.png')
    expect(image.getAttribute('data-loaded')).to.equal('1')
    expect(image.hasAttribute('data-src')).to.equal(false)
    expect(observer.unobserved).to.deep.equal([image])

    teardown()
    await afterFlush()

    expect(observer.disconnectCalls).to.equal(1)
  })
})
