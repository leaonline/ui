import { TaskRenderers } from '../Renderers'

export const TaskRendererFactoryUtils = {}

/**
 * internal state of already loaded renderers by subtype name
 * @private
 */
const loaded = new ReactiveDict()

/**
 * Loads a given renderer template for given subtype.
 *
 * @param subtype {string}
 * @return {Promise<object>}
 */
TaskRendererFactoryUtils.loadRenderer = async ({ subtype }) => {
  // skip current autorun if we have no content
  // or the template has already been loaded
  // for this current content type
  if (!subtype || loaded.get(subtype)) {
    return
  }

  const rendererContext = TaskRenderers.get(subtype)
  if (!rendererContext) {
    // something weirdly failed, we set an error context here
    throw new Meteor.Error('taskRenderers.error', 'taskRenderers.missing', {
      subtype,
    })
  }

  await rendererContext.load(rendererContext.__initOptions)
  loaded.set(subtype, rendererContext.template)
  return rendererContext
}

/**
 * Get a context object that is used to dynamically render
 * the current loaded template.
 * @param content {object}
 * @param data {object}
 * @return {{template: string, data: object}}
 */
TaskRendererFactoryUtils.getRendererContext = ({ content, data }) => {
  content.type = data.type
  const template = loaded.get(content.subtype)
  return template && { template, data: content }
}
