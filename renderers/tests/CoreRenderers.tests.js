import { expect } from 'chai'
import { Choice } from 'meteor/leaonline:corelib/items/choice/Choice'
import { Highlight } from 'meteor/leaonline:corelib/items/highlight/Highlight'
import { Connect } from 'meteor/leaonline:corelib/items/interactive/Connect'
import { Sort } from 'meteor/leaonline:corelib/items/sort/Sort'
import { Cloze } from 'meteor/leaonline:corelib/items/text/Cloze'
import { Scoring } from 'meteor/leaonline:corelib/scoring/Scoring'
import { Template } from 'meteor/templating'
import { CoreRenderers } from '../CoreRenderers'
import { RendererGroups } from '../RendererGroups'

describe('CoreRenderers', () => {
  const definitions = [
    [Choice, 'choiceItemRenderer'],
    [Connect, 'connectItemRenderer'],
    [Sort, 'sortItemRenderer'],
    [Cloze, 'clozeItemRenderer'],
    [Highlight, 'itemHighlightRenderer'],
  ]

  it('uses core item definitions for its renderer metadata', () => {
    const configs = CoreRenderers.get()
    expect(configs.map(({ name }) => name)).to.deep.equal([
      ...definitions.map(([item]) => item.name),
      Scoring.name,
    ])
    for (const [item, template] of definitions) {
      const config = configs.find(({ name }) => name === item.name)
      expect(config).to.include({
        name: item.name,
        label: item.label,
        icon: item.icon,
        template,
        group: RendererGroups.items.name,
      })
      expect(config.load).to.be.a('function')
    }
    expect(configs.find(({ name }) => name === Scoring.name)).to.include({
      template: 'itemScoringRenderer',
      exclude: true,
    })
  })

  it('iterates every configuration in the same order as get', () => {
    const seen = []
    CoreRenderers.forEach((config, index) => seen.push([config, index]))
    expect(seen.map(([config]) => config)).to.deep.equal(CoreRenderers.get())
    expect(seen.map(([, index]) => index)).to.deep.equal([0, 1, 2, 3, 4, 5])
  })

  for (const [item, template] of [
    ...definitions,
    [Scoring, 'itemScoringRenderer'],
  ]) {
    it(`loads the ${item.name} template`, async () => {
      const renderer = CoreRenderers.get().find(
        ({ name }) => name === item.name,
      )
      await renderer.load()
      expect(Template[template]).to.be.an.instanceOf(Template)
    })
  }
})
