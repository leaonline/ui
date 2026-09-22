/* eslint-env mocha */
import { expect } from 'chai'
import { createTemplateRenderingContext } from '../../../tests/blazeHelpers.tests'
import '../actionButton'

describe('actionButton', () => {
  const { render, setup, teardown } = createTemplateRenderingContext()
  beforeEach(() => setup())
  afterEach(() => teardown())

  it('renders action-button attributes, label, left icon, and no sound', async () => {
    const root = await render('actionButton', {
      id: 'action-group',
      title: 'Action title',
      class: 'action-wrapper',
      sound: false,
      label: 'Save',
      icon: 'check',
      iconPos: 'left',
      type: 'success',
      btnClass: 'action-control',
      disabled: true,
      'data-tracking': 'action',
    })
    const wrapper = root.firstElementChild
    const button = wrapper.querySelector('button.lea-action-button')
    const label = button.querySelector('.lea-text')
    const icon = button.querySelector('i.fa-check')

    expect(wrapper.id).to.equal('action-group')
    expect(wrapper.title).to.equal('Action title')
    expect(wrapper.classList.contains('action-wrapper')).to.equal(true)
    expect(wrapper.querySelector('.lea-sound-btn')).to.equal(null)

    expect(button.id).to.equal('action-group')
    expect(button.title).to.equal('Action title')
    expect(button.getAttribute('aria-label')).to.equal('Save')
    expect(button.getAttribute('data-tracking')).to.equal('action')
    expect(button.hasAttribute('disabled')).to.equal(true)
    expect(button.classList.contains('action-control')).to.equal(true)
    expect(label.textContent).to.equal('Save')
    expect(button.firstElementChild.contains(icon)).to.equal(true)
  })
})
