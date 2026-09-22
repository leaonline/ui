/* eslint-env mocha */
import { expect } from 'chai'
import { createTemplateRenderingContext } from '../../../tests/blazeHelpers.tests'
import '../text'

describe('text', () => {
  const { render, setup, teardown } = createTemplateRenderingContext()
  beforeEach(() => setup())
  afterEach(() => teardown())

  it('renders text wrapper classes and the whitespace token sequence', async () => {
    const root = await render('text', {
      src: ' alpha  beta ',
      class: 'custom-text',
    })
    const wrapper = root.querySelector('.text-wrapper')
    const tokens = Array.from(
      wrapper.querySelectorAll('.lea-text-token'),
      (element) => element.textContent,
    )

    expect(wrapper.classList.contains('lea-text')).to.equal(true)
    expect(wrapper.classList.contains('lea-text-bold')).to.equal(false)
    expect(wrapper.classList.contains('custom-text')).to.equal(true)
    expect(tokens).to.deep.equal(['', 'alpha', 'beta', ''])
  })
  it('renders bold text wrapper classes and the whitespace token sequence', async () => {
    const root = await render('text', {
      src: ' alpha  beta ',
      bold: true,
      class: 'custom-text',
    })
    const wrapper = root.querySelector('.text-wrapper')
    const tokens = Array.from(
      wrapper.querySelectorAll('.lea-text-token'),
      (element) => element.textContent,
    )

    expect(wrapper.classList.contains('lea-text')).to.equal(false)
    expect(wrapper.classList.contains('lea-text-bold')).to.equal(true)
    expect(wrapper.classList.contains('custom-text')).to.equal(true)
    expect(tokens).to.deep.equal(['', 'alpha', 'beta', ''])
  })
})
