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
    async load () {
      return import('./factory/TaskRendererFactory.js')
    },
    exclude: true
  },
  page: {
    name: 'page',
    label: 'taskRenderers.page',
    template: 'taskPageRenderer',
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
    }
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
    async load () {
      return import('./markdown/markdownRenderer')
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
  }
}

const rendererMap = new Map(Object.entries(defaults))
let _initialized = false

export const TaskRenderers = {
  groups: RendererGroups,
  get: key => {
    console.info(key, rendererMap.get(key), rendererMap)
    return rendererMap.get(key) },
  getGroup: (group) => {
    // should we do caching here or on a component level?
    return Array.from(rendererMap.values()).filter(el => el.group === group)
  },
  init: async function () {
    if (_initialized) return true

    // load the factory
    const factory = TaskRenderers.get(defaults.factory.name)
    await factory.load()
    console.log('[TaskRenderers]: factory loaded')

    // register the default item renderers
    const { CoreRenderers } = await import('./CoreRenderers')
    CoreRenderers.forEach(rendererContext => {
      console.info('[TaskRenderers]: register core renderer', rendererContext.name)
      rendererMap.set(rendererContext.name, rendererContext)
    })

    _initialized = true
    return true
  },
  registerRenderer: ({ name, group, renderer: { template, load } }) => rendererMap.set(name, {
    name,
    group,
    template,
    load
  })
}
