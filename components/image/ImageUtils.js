import { Components } from '../Components'

export const ImageUtils = {}

const imageClass = 'lea-image'

ImageUtils.getAttributes = ({ data, instanceId }) => {
  const customClasses = data.class || ''
  const shadowClass = data.shadow ? 'shadow' : ''
  const classes = `${imageClass} ${shadowClass} ${customClasses}`
  const obj = {}
  const cors = data.cors || data.crossorigin

  if (cors) {
    obj.crossorigin = cors
  }

  Object.keys(data).forEach((key) => {
    if (key.includes('data-') || key.includes('aria-')) {
      obj[key] = data[key]
    }
  })

  const base = Components.contentPath()
  const imageSrc = data.src.startsWith('http') ? data.src : `${base}${data.src}`

  const attributes = {
    'data-id': instanceId,
    title: data.title,
    alt: data.alt,
    'aria-title': data.title,
    width: data.width,
    height: data.height,
    class: classes,
    'data-src': imageSrc,
  }

  return Object.assign(obj, attributes)
}
