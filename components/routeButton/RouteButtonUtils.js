import { getBsType } from '../../utils/bootstrapUtils'

export const RouteButtonUtils = {}

RouteButtonUtils.getAttributes = ({ data }) => {
  const btnType = getBsType(data.type, data.outline)
  const btnBlock = data.block ? 'w-100' : ''
  const customClass = data.btnClass || ''
  const activeClass = data.active ? 'active' : ''
  const bgClass = `lea-text lea-route-btn-${btnType}`
  const sm = data.sm ? 'btn-sm' : ''
  const lg = data.lg ? 'btn-lg' : ''
  const ml = data.group ? '' : 'ms-2 '
  const atts = {
    id: data.id,
    title: data.title,
    class: `lea-route-button shadow-sm ms-2 ${ml} btn btn-${btnType} ${btnBlock} ${bgClass} ${sm} ${lg} ${activeClass} ${customClass}`,
    'aria-label': data.label || data.title,
  }

  atts.href = data.href ? data.href : ''

  if (data.target) {
    atts.target = data.target
  }

  Object.keys(data).forEach((key) => {
    if (key.indexOf('data-') === -1) return
    atts[key] = data[key]
  })

  return atts
}

RouteButtonUtils.getGroupAttributes = ({ data }) => {
  const groupClass = data.group ? 'btn-group' : ''
  const customClass = data.class || ''
  const defaultClass = data.sound !== false ? 'd-flex align-items-center' : ''

  const atts = {
    id: data.id,
    title: data.title,
    class: `${defaultClass} ${groupClass} ${customClass}`,
  }

  if (groupClass) atts.role = 'group'

  return atts
}
