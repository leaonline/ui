export const TextUtils = {}

const whiteSpace = /\s+/g

TextUtils.getAttributes = ({ data }) => {
  const textClass = data.bold ? 'lea-text-bold' : 'lea-text'
  const additionalClass = data.class || ''
  return {
    class: `${textClass} text-wrapper ${additionalClass}`,
  }
}

TextUtils.getTokens = ({ data }) => {
  return data.src.split(whiteSpace)
}
