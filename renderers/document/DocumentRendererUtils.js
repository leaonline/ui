export const DocumentRendererUtils = {}

DocumentRendererUtils.replacer = () =>
  /**
   * JSON.stringify replacer, specifically
   * to display data documents in a preformatted
   * code html element.
   *
   * @param key {string}
   * @param value {any}
   * @return any
   */
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
