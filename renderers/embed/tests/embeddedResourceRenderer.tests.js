import { expect } from 'chai'
import { ReactiveVar } from 'meteor/reactive-var'
import { createTemplateRenderingContext } from '../../../tests/blazeHelpers.tests'
import '../embeddedResourceRenderer'

describe('embeddedResourceRenderer', () => {
  const { render, setup, teardown, afterFlush } =
    createTemplateRenderingContext()
  beforeEach(setup)
  afterEach(teardown)

  it('renders supplied markup inside a responsive container', async () => {
    const root = await render('embeddedResourceRenderer', {
      value: '<strong title="Embedded content">Example</strong>',
    })
    const wrapper = root.querySelector('.embed-responsive-16by9')
    expect(wrapper.classList.contains('embed-responsive')).to.equal(true)
    expect(wrapper.querySelector('strong').textContent).to.equal('Example')
    expect(wrapper.querySelector('strong').title).to.equal('Embedded content')
  })

  it('replaces the embedded content when its data changes', async () => {
    const data = new ReactiveVar({ value: '<strong>First</strong>' })
    const root = await render('embeddedResourceRenderer', () => data.get())
    data.set({ value: '<em>Second</em>' })
    await afterFlush()
    expect(root.querySelector('strong')).to.equal(null)
    expect(root.querySelector('em').textContent).to.equal('Second')

    data.set({ value: '' })
    await afterFlush()
    expect(root.querySelector('.embed-responsive').textContent.trim()).to.equal(
      '',
    )
  })
})
