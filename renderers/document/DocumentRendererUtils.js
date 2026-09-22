export const DocumentRendererUtils = {}

DocumentRendererUtils.replacer = () =>
  function replacer(key, value) {
    let val = value

    if (typeof val === 'string') {
      try {
        val = JSON.parse(value)
      } catch (e) {}
    }

    if (typeof val === 'string' && val.includes('\n')) {
      val = val.split(/\n\s*/g)
    }

    return val
  }
