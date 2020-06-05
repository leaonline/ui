import { Choice } from 'meteor/leaonline:corelib/items/choice/Choice'
import { Cloze } from 'meteor/leaonline:corelib/items/text/Cloze'
import { Highlight } from 'meteor/leaonline:corelib/items/highlight/Highlight'
import { Scoring } from 'meteor/leaonline:corelib/scoring/Scoring'
import { RendererGroups } from './RendererGroups'

export const CoreRenderers = {}

const allConfigs = []

allConfigs.push({
  name: Choice.name,
  group: RendererGroups.items.name,
  label: Choice.label,
  icon: Choice.icon,
  template: 'choiceItemRenderer',
  async load () {
    return import('./items/choice/choiceItemRenderer')
  }
})

allConfigs.push({
  name: Cloze.name,
  group: RendererGroups.items.name,
  label: Cloze.label,
  icon: Cloze.icon,
  template: 'clozeItemRenderer',
  load: async function () {
    return import('./items/cloze/clozeItemRenderer')
  }
})

allConfigs.push({
  name: Highlight.name,
  group: RendererGroups.items.name,
  label: Highlight.label,
  icon: Highlight.icon,
  template: 'itemHighlightRenderer',
  async load () {
    return import('./items/highlight/itemHighlightRenderer')
  },

})

allConfigs.push({
  name: Scoring.name,
  template: 'itemScoringRenderer',
  async load () {
    return import('./scoring/scoring')
  },
  exclude: true
})


CoreRenderers.forEach = cb => allConfigs.forEach(cb)
CoreRenderers.get  = () => allConfigs

