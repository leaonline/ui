/* eslint-env mocha */
import { expect } from 'chai'
import { createTemplateRenderingContext } from '../../../tests/blazeHelpers.tests'
import '../routeButton'

describe('routeButton', () => {
  const { render, setup, teardown } = createTemplateRenderingContext()
  beforeEach(() => setup())
  afterEach(() => teardown())

  it('renders a grouped route button through getGroupAttributes', async () => {
    const root = await render('routeButton', {
      id: 'route-group',
      title: 'Route title',
      class: 'route-wrapper',
      sound: false,
      group: true,
      href: '/destination',
      target: '_blank',
      label: 'Continue',
      labelClass: 'route-label',
      icon: 'arrow-right',
      iconPos: 'right',
      type: 'primary',
      outline: true,
      btnClass: 'route-link',
      'data-tracking': 'route',
    })
    const wrapper = root.firstElementChild
    const link = wrapper.querySelector('a')
    const label = link.querySelector('.route-label')
    const icon = link.querySelector('i.fa-arrow-right')

    expect(wrapper.id).to.equal('route-group')
    expect(wrapper.title).to.equal('Route title')
    expect(wrapper.classList.contains('btn-group')).to.equal(true)
    expect(wrapper.classList.contains('route-wrapper')).to.equal(true)
    expect(wrapper.getAttribute('role')).to.equal('group')

    expect(link.id).to.equal('route-group')
    expect(link.title).to.equal('Route title')
    expect(link.getAttribute('href')).to.equal('/destination')
    expect(link.getAttribute('target')).to.equal('_blank')
    expect(link.getAttribute('aria-label')).to.equal('Continue')
    expect(link.getAttribute('data-tracking')).to.equal('route')
    expect(link.classList.contains('route-link')).to.equal(true)
    expect(label.textContent).to.equal('Continue')
    expect(link.lastElementChild.contains(icon)).to.equal(true)
  })
})
