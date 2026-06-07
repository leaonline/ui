import { Template } from 'meteor/templating'
import { getBsType } from '../../utils/bootstrapUtils'

import '../soundbutton/soundbutton'
import './actionButton.html'

Template.actionButton.helpers({
  soundButtonAtts () {
    // tts=tts text=label outline=true sm=sm lg=lg type=type active=active class=sndBtnClass
    const instance = Template.instance()
    const { data } = instance
    if (data.sound === false) {
      return null
    }

    return {
      tts: data.tts,
      text: data.text || data.label,
      outline: typeof data.outline === 'boolean' ? data.outline : true,
      sm: data.sm,
      lg: data.lg,
      type: data.type || 'secondary',
      active: data.active,
      class: data.sndBtnClass
    }
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
  iconClass (base) {
    const instance = Template.instance()
    const { data } = instance
    const custom = data.iconClass ?? ''
    return `${base} ${custom}`
  },
  attributes () {
    const instance = Template.instance()
    const { data } = instance

    const btnType = getBsType(data.type, data.outline)
    const btnBlock = data.block ? 'w-100' : ''
    const customClass = data.btnClass || ''
    const activeClass = data.active ? 'active' : ''
    const defaultBg = `lea-action-btn-${btnType}`
    const bgClass = `lea-text ${defaultBg}`
    const hasIconClass = data.icon ? 'd-flex justify-content-between align-items-center': ''
    const atts = {
      id: data.id,
      title: data.title,
      class: `lea-action-button shadow-sm ms-2 btn btn-${btnType} ${btnBlock} ${bgClass} ${activeClass} ${hasIconClass} ${customClass}`,
      'aria-label': data.label || data.title
    }

    if (data.href) {
      atts.href = data.href
    }

    if (data.disabled) {
      atts.disabled = ''
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

    const customClass = data.class || ''
    const defaultClass = data.sound !== false ? 'd-flex align-items-center' : ''

    return {
      id: data.id,
      title: data.title,
      class: `${defaultClass} ${customClass}`
    }
  }
})
