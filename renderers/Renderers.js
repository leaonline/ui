import { RendererGroups } from './RendererGroups'

const widthOptions = (i18n) => [
  { value: '12', label: i18n('grid.12') },
  { value: '8', label: i18n('grid.8') },
  { value: '6', label: i18n('grid.6') },
  { value: '4', label: i18n('grid.4') },
  { value: '2', label: i18n('grid.2') }
]

const defaults = {
  factory: {
    name: 'factory',
    label: 'taskRenderers.factory',
    template: 'TaskRendererFactory',
    group: RendererGroups.documents.name,
    async load () {
      return import('./factory/TaskRendererFactory.js')
    }
  },
  page: {
    name: 'page',
    label: 'taskRenderers.page',
    template: 'taskPageRenderer',
    group: RendererGroups.documents.name,
    async load () {
      return import('./page/taskPageRenderer.js')
    },
    exclude: true
  },
  text: {
    name: 'text',
    group: RendererGroups.layout.name,
    schema: ({ i18n }) => ({
      type: {
        type: String,
        defaultValue: 'text',
        autoform: {
          type: 'hidden'
        }
      },
      subtype: {
        type: String,
        defaultValue: 'text',
        autoform: {
          type: 'hidden'
        }
      },
      value: {
        type: String,
        autoform: {
          type: 'textarea',
          rows: 4
        }
      },
      hidden: {
        type: Boolean,
        defaultValue: false,
        optional: true
      },
      width: {
        type: String,
        defaultValue: '12',
        autoform: {
          firstOption: false,
          options () {
            return widthOptions(i18n)
          }
        }
      }
    }),
    label: 'taskRenderers.layout.text.title',
    icon: 'align-justify',
    template: 'textRenderer',
    async load () {
      return import('./text/textRenderer')
    },
    data: {}
  },
  markdown: {
    name: 'markdown',
    group: RendererGroups.layout.name,
    schema: ({ i18n }) => ({
      type: {
        type: String,
        defaultValue: 'text',
        autoform: {
          type: 'hidden'
        }
      },
      subtype: {
        type: String,
        defaultValue: 'markdown',
        autoform: {
          type: 'hidden'
        }
      },
      value: {
        type: String,
        autoform: {
          type: 'markdown'
        }
      },
      padding: {
        type: Number,
        optional: true,
        defaultValue: 0,
        min: 0,
        max: 5
      },
      lineHeight: {
        type: Number,
        optional: true,
        defaultValue: 0,
        min: 0,
        max: 5
      },
      background: {
        type: String,
        optional: true,
        autoform: {
          options: () => [
            { value: 'light', label: i18n('colors.light') },
            { value: 'dark', label: i18n('colors.dark') }
          ]
        }
      },
      textColor: {
        type: String,
        optional: true,
        autoform: {
          options: () => [
            { value: 'light', label: i18n('colors.light') },
            { value: 'dark', label: i18n('colors.dark') }
          ]
        }
      },
      width: {
        type: String,
        defaultValue: '12',
        autoform: {
          firstOption: false,
          options () {
            return widthOptions(i18n)
          }
        }
      }
    }),
    label: 'taskRenderers.layout.markdown.title',
    icon: 'hashtag',
    template: 'markdownRenderer',
    async load (options) {
      const { Markdown } = await import('./markdown/markdownRenderer')
      Markdown.init(options)
    }
  },
  image: {
    name: 'image',
    group: RendererGroups.layout.name,
    schema: ({ i18n, imageForm }) => ({
      type: {
        type: String,
        defaultValue: 'media',
        autoform: {
          type: 'hidden'
        }
      },
      subtype: {
        type: String,
        defaultValue: 'image',
        autoform: {
          type: 'hidden'
        }
      },
      value: {
        type: String,
        autoform: imageForm
      },
      width: {
        type: String,
        defaultValue: 'col-12',
        autoform: {
          firstOption: false,
          options () {
            return widthOptions(i18n)
          }
        }
      }
    }),
    label: 'taskRenderers.layout.image.title',
    icon: 'image',
    template: 'imageRenderer',
    async load () {
      return import('./image/imageRenderer')
    }
  },
  document: {
    name: 'document',
    label: 'taskRenderers.document',
    template: 'documentRenderer',
    group: RendererGroups.documents.name,
    async load () {
      return import('./document/documentRenderer.js')
    },
    exclude: true
  }
}

const rendererMap = new Map(Object.entries(defaults))
let _initialized = false

export const TaskRenderers = {
  groups: RendererGroups,
  fallbackRenderer: 'document',
  get: key => {
    return rendererMap.get(key)
  },
  factory: () => Object.assign({}, defaults.factory),
  getGroup: (group) => {
    // should we do caching here or on a component level?
    return Array.from(rendererMap.values()).filter(el => el.group === group)
  },
  init: async function (options = {}) {
    if (_initialized) return true

    // load the factory
    const factory = TaskRenderers.get(defaults.factory.name)
    await factory.load(factory.__initOptions)

    const pageRender = TaskRenderers.get(defaults.page.name)
    await pageRender.load(pageRender.__initOptions)

    // register the default item renderers
    const { CoreRenderers } = await import('./CoreRenderers')
    CoreRenderers.forEach(rendererCtx => {
      rendererMap.set(rendererCtx.name, rendererCtx)
    })

    // once we have all renderer added to the map
    // we can assign them init options
    rendererMap.forEach(rendererCtx => {
      if (rendererCtx.name in options) {
        rendererCtx.__initOptions = options[rendererCtx.name]
      }
    })

    _initialized = true
    return true
  },
  registerRenderer: (renderer) => rendererMap.set(renderer.name, renderer)
}
