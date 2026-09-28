import { expect } from 'chai'
import { Random } from 'meteor/random'
import { competencyCollection as collection } from '../../../tests/competencyFixtures.tests'
import { ScoringRendererUtils } from '../ScoringRendererUtils'

describe('ScoringRendererUtils', () => {
  let first
  let second
  beforeEach(() => {
    first = collection.insert({
      _id: Random.id(),
      shortCode: 'R1',
      description: 'Read words',
    })
    second = collection.insert({
      _id: Random.id(),
      shortCode: 'W1',
      description: 'Write words',
    })
  })
  afterEach(() => collection.remove({ _id: { $in: [first, second] } }))

  it('resolves a single competency to its representative text', () => {
    expect(ScoringRendererUtils.getCompetencies(first)).to.deep.equal([
      'R1 - Read words',
    ])
  })

  it('accepts arrays without duplicating competencies or changing the selector', () => {
    const selector = [first, second, first]
    expect(ScoringRendererUtils.getCompetencies(selector)).to.have.members([
      'R1 - Read words',
      'W1 - Write words',
    ])
    expect(selector).to.deep.equal([first, second, first])
  })

  it('supports an existing Mongo ID selector', () => {
    expect(
      ScoringRendererUtils.getCompetencies({ $in: [second] }),
    ).to.deep.equal(['W1 - Write words'])
  })

  it('returns no representatives for empty or missing IDs', () => {
    expect(ScoringRendererUtils.getCompetencies([])).to.deep.equal([])
    expect(
      ScoringRendererUtils.getCompetencies('missing-competency'),
    ).to.deep.equal([])
  })
})
