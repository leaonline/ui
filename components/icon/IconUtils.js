export const IconUtils = {}

IconUtils.getAttributes = ({ data }) => {
  const fw = data.fw ? 'fa-fw' : ''
  const pulse = data.pulse ? 'fa-pulse' : ''
  const spinning = data.spin ? 'fa-spin' : ''
  const name = data.name
  const regular = data.far && 'far'
  const solid = data.fas && 'fas'
  const type = regular || solid || 'far'
  const scale = data.scale ? `fa-${data.scale}x` : ''
  const classAtts = `fa ${type} ${fw} fa-${name} ${pulse} ${spinning} ${scale}`
  return {
    class: classAtts,
    title: data.title,
    'aria-title': data.title,
  }
}
