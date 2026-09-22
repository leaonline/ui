import { Blaze } from 'meteor/blaze'
import { TTSEngine } from 'meteor/leaonline:corelib/tts/TTSEngine'
import { Template } from 'meteor/templating'
import { Tracker } from 'meteor/tracker'

const withDiv = function withDiv(callback) {
  const el = document.createElement('div')
  document.body.appendChild(el)
  try {
    callback(el)
  } finally {
    document.body.removeChild(el)
  }
}

export const withRenderedTemplate = function withRenderedTemplate(
  template,
  data,
  callback,
) {
  withDiv((el) => {
    const ourTemplate =
      typeof template === 'string' ? Template[template] : template
    Blaze.renderWithData(ourTemplate, data, el)
    Tracker.flush()
    callback(el)
  })
}

export const createTemplateRenderingContext = () => {
  let host
  let view
  let originalIsConfigured
  let originalIntersectionObserver
  let hadIntersectionObserver

  const afterFlush = () => new Promise((resolve) => Tracker.afterFlush(resolve))

  const render = async (templateName, data) => {
    host = document.createElement('div')
    document.body.appendChild(host)
    view = Blaze.renderWithData(Template[templateName], data, host)
    await afterFlush()
    return host
  }

  const setup = () => {
    originalIsConfigured = TTSEngine.isConfigured
    hadIntersectionObserver = Object.hasOwn(globalThis, 'IntersectionObserver')
    originalIntersectionObserver = globalThis.IntersectionObserver
  }

  const teardown = () => {
    if (view) {
      Blaze.remove(view)
      view = undefined
    }
    if (host?.isConnected) {
      host.remove()
    }
    host = undefined

    TTSEngine.isConfigured = originalIsConfigured
    if (hadIntersectionObserver) {
      globalThis.IntersectionObserver = originalIntersectionObserver
    } else {
      delete globalThis.IntersectionObserver
    }
  }

  return {
    host,
    view,
    originalIsConfigured,
    originalIntersectionObserver,
    hadIntersectionObserver,
    afterFlush,
    teardown,
    render,
    setup,
  }
}
