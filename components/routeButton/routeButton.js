import { Template } from 'meteor/templating'
import { getBsType } from '../../utils/bootstrapUtils'

import '../soundbutton/soundbutton'
import './routeButton.html'

Template.routeButton.helpers({
  sound () {
    const instance = Template.instance()
    return instance.data.sound !== false
  },
  leftIcon () {
    const instance = Template.instance()
    const { data } = instance
    return data.icon && data.iconPos !== 'right'
  },
  rightIcon () {
    const instance = Template.instance()
    const { data } = instance
    return data.icon && data.iconPos === 'right'
  },
  attributes () {
    const instance = Template.instance()
    const { data } = instance

    const btnType = getBsType(data.type, data.outline)
    const btnBlock = data.block ? 'btn-block' : ''
    const customClass = data.btnClass || ''
    const activeClass = data.active ? 'active' : ''
    const bgClass = `lea-text lea-route-btn-${btnType}`
    const sm = data.sm ? 'btn-sm' : ''
    const lg = data.lg ? 'btn-lg' : ''
    const ml = data.group ? '' : 'ms-2 '
    const atts = {
      id: data.id,
      title: data.title,
      class: `lea-route-button ${ml} btn btn-${btnType} ${btnBlock} ${bgClass} ${sm} ${lg} ${activeClass} ${customClass}`,
      'aria-label': data.label || data.title
    }

    atts.href = data.href
      ? data.href
      : ''

    if (data.target) {
      atts.target = data.target
    }

    Object.keys(data).forEach(key => {
      if (key.indexOf('data-') === -1) return
      atts[key] = data[key]
    })

    return atts
  },
  groupAttributes () {
    const instance = Template.instance()
    const { data } = instance

    const groupClass = data.group ? 'btn-group' : ''
    const customClass = data.class || ''
    const defaultClass = data.sound !== false ? 'd-flex align-items-center' : ''

    const atts = {
      id: data.id,
      title: data.title,
      class: `${defaultClass} ${groupClass} ${customClass}`
    }

    if (groupClass) atts.role = 'group'

    return atts
  }
})
