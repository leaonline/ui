import { expect } from 'chai'
import { Random } from 'meteor/random'
import { ReactiveVar } from 'meteor/reactive-var'
import { createTemplateRenderingContext } from '../../../tests/blazeHelpers.tests'
import { competencyCollection as collection } from '../../../tests/competencyFixtures.tests'
import '../scoring'

describe('itemScoringRenderer', () => {
  const { render, setup, teardown, afterFlush } =
    createTemplateRenderingContext()
  let ids
  beforeEach(() => {
    setup()
    ids = ['Read', 'Write', 'Listen'].map((description, index) =>
      collection.insert({
        _id: Random.id(),
        shortCode: `C${index}`,
        description,
      }),
    )
  })
  afterEach(() => {
    teardown()
    collection.remove({ _id: { $in: ids } })
  })

  it('distinguishes accomplished, incorrect and omitted scores with text and icons', async () => {
    const root = await render('itemScoringRenderer', {
      scores: [
        { competency: ids[0], score: 1 },
        { competency: ids[1], score: 0 },
        { competency: ids[2], score: 1, isUndefined: true },
      ],
    })
    const rows = [...root.querySelectorAll('li')]
    expect(rows.map((row) => row.textContent.trim())).to.deep.equal([
      'C0 - Read',
      'C1 - Write',
      'C2 - Listen',
    ])
    for (const [index, border, icon] of [
      [0, 'success', 'check'],
      [1, 'danger', 'times'],
      [2, 'light', 'question'],
    ]) {
      expect(rows[index].classList.contains(`border-${border}`)).to.equal(true)
      expect(rows[index].querySelector(`.fa-${icon}`)).not.to.equal(null)
    }
    expect(rows[2].classList.contains('text-success')).to.equal(false)
    expect(rows[2].querySelector('.fa-check')).to.equal(null)
  })

  it('renders one row per matching competency and no rows for missing IDs', async () => {
    const root = await render('itemScoringRenderer', {
      scores: [
        { competency: [ids[0], ids[1]], score: true },
        { competency: 'missing', score: false },
      ],
    })
    expect(root.querySelectorAll('li')).to.have.length(2)
    expect(root.querySelectorAll('.fa-check')).to.have.length(2)
  })

  it('reacts to score changes and competency document updates', async () => {
    const data = new ReactiveVar({ scores: [] })
    const root = await render('itemScoringRenderer', () => data.get())
    expect(root.querySelectorAll('li')).to.have.length(0)
    data.set({ scores: [{ competency: ids[0], score: false }] })
    await afterFlush()
    expect(root.querySelector('.fa-times')).not.to.equal(null)
    collection.update(ids[0], { $set: { description: 'Updated' } })
    await afterFlush()
    expect(root.querySelector('li').textContent.trim()).to.equal('C0 - Updated')
    data.set({ scores: [{ competency: ids[0], score: true }] })
    await afterFlush()
    expect(root.querySelector('.fa-check')).not.to.equal(null)
    expect(root.querySelector('.fa-times')).to.equal(null)
  })
})
