/* eslint-env mocha */
import { expect } from 'chai'
import { createTemplateRenderingContext } from '../../../tests/blazeHelpers.tests'
import '../icon'

describe('icon', () => {
  const { render, setup, teardown } = createTemplateRenderingContext()
  beforeEach(() => setup())
  afterEach(() => teardown())

  it('renders the initial reactive icon state', async () => {
    const root = await render('icon', {
      name: 'volume-up',
      class: 'icon-wrapper',
      fas: true,
      fw: true,
      pulse: true,
      scale: 2,
      title: 'Listen',
    })
    const wrapper = root.querySelector('.icon-wrapper')
    const icon = wrapper.querySelector('i')

    expect(icon.getAttribute('class')).to.equal(
      'fa fas fa-fw fa-volume-up fa-pulse fa-2x',
    )
    expect(icon.getAttribute('title')).to.equal('Listen')
    expect(icon.getAttribute('aria-title')).to.equal('Listen')
  })
})
