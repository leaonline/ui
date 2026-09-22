import { getBsType } from '../../utils/bootstrapUtils'

export const ActionButtonUtils = {}

ActionButtonUtils.getAttributes = ({ data }) => {
  const btnType = getBsType(data.type, data.outline)
  const btnBlock = data.block ? 'w-100' : ''
  const customClass = data.btnClass || ''
  const activeClass = data.active ? 'active' : ''
  const defaultBg = `lea-action-btn-${btnType}`
  const bgClass = `lea-text ${defaultBg}`
  const hasIconClass = data.icon
    ? 'd-flex justify-content-between align-items-center'
    : ''
  const atts = {
    id: data.id,
    title: data.title,
    class: `lea-action-button shadow-sm ms-2 btn btn-${btnType} ${btnBlock} ${bgClass} ${activeClass} ${hasIconClass} ${customClass}`,
    'aria-label': data.label || data.title,
  }

  if (data.href) {
    atts.href = data.href
  }

  if (data.disabled) {
    atts.disabled = ''
  }

  Object.keys(data).forEach((key) => {
    if (key.indexOf('data-') === -1) return
    atts[key] = data[key]
  })

  return atts
}

ActionButtonUtils.getGroupAttributes = ({ data }) => {
  const customClass = data.class || ''
  const defaultClass = data.sound !== false ? 'd-flex align-items-center' : ''

  return {
    id: data.id,
    title: data.title,
    class: `${defaultClass} ${customClass}`,
  }
}

ActionButtonUtils.getSoundButtonAttributes = ({ data }) => {
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
    class: data.sndBtnClass,
  }
}

ActionButtonUtils.leftIcon = ({ data }) => {
  return data.icon && data.iconPos !== 'right'
}

ActionButtonUtils.rightIcon = ({ data }) => {
  return data.icon && data.iconPos === 'right'
}

ActionButtonUtils.iconClass = ({ data, base }) => {
  const custom = data.iconClass ?? ''
  return `${base} ${custom}`
}
