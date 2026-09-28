import { expect } from 'chai'
import { Cloze } from 'meteor/leaonline:corelib/items/text/Cloze'
import { ClozeItemRendererUtils as utils } from '../utils/ClozeItemRendererUtils'

describe('ClozeItemRendererUtils', () => {
  it('resolves named flavors and classifies only the matching numeric value', () => {
    for (const [name, predicate] of [
      ['blanks', 'isBlank'],
      ['select', 'isSelect'],
      ['empty', 'isEmpty'],
      ['text', 'isText'],
    ]) {
      const flavor = Cloze.flavor[name].value
      expect(utils.getFlavor(name)).to.equal(flavor)
      for (const value of [
        undefined,
        null,
        -1,
        0,
        1,
        2,
        3,
        4,
        String(flavor),
      ]) {
        expect(utils[predicate](value), `${predicate}(${value})`).to.equal(
          value === flavor,
        )
      }
    }
    expect(utils.getFlavor('unknown')).to.equal(undefined)
    expect(utils.getFlavor(undefined)).to.equal(undefined)
  })

  it('considers only blanks and selects to be scored items', () => {
    for (const flavor of Object.values(Cloze.flavor)) {
      expect(utils.isItem(flavor.value)).to.equal(
        ['blanks', 'select'].includes(flavor.name),
      )
    }
    expect(utils.isItem(undefined)).to.equal(false)
  })

  describe('getFeedbackForToken', () => {
    const blank = (overrides = {}) => ({
      itemId: 'item-a',
      itemIndex: 0,
      flavor: Cloze.flavor.blanks.value,
      value: [{ value: 'answer' }],
      ...overrides,
    })

    it('ignores non-item tokens and scores for other items or targets', () => {
      const scores = [
        { itemId: 'item-b', target: 0 },
        { itemId: 'item-a', target: 1 },
      ]
      expect(utils.getFeedbackForToken({ scores, token: blank() })).to.equal(
        undefined,
      )
      expect(
        utils.getFeedbackForToken({ scores: [], token: blank() }),
      ).to.equal(undefined)
      for (const flavor of [
        Cloze.flavor.empty.value,
        Cloze.flavor.text.value,
        undefined,
      ]) {
        expect(
          utils.getFeedbackForToken({
            scores: [{ itemId: 'item-a', target: 0 }],
            token: blank({ flavor }),
          }),
        ).to.equal(undefined)
      }
    })

    it('matches numeric and string targets and reports successful feedback', () => {
      const token = blank()
      const scores = [
        {
          itemId: 'item-a',
          target: '0',
          score: 1,
          expected: /answer/i,
          isUndefined: false,
        },
      ]
      expect(utils.getFeedbackForToken({ scores, token })).to.deep.equal({
        wasScored: true,
        isValid: true,
        correctResponse: '/answer/i',
        color: 'success',
        isUndefined: false,
      })
      expect(token).not.to.have.property('wasScored')
      expect(scores[0]).not.to.have.property('color')
    })

    it('shows the expected blank for an incorrect or omitted response', () => {
      for (const isUndefined of [false, true]) {
        const result = utils.getFeedbackForToken({
          token: blank(),
          scores: [{ itemId: 'item-a', target: 0, score: 0, isUndefined }],
        })
        expect(result).to.deep.equal({
          wasScored: true,
          isValid: false,
          correctResponse: '',
          color: 'danger',
          isUndefined,
          expected: 'answer',
        })
      }
    })

    it('selects the expected value at the token index for compound tokens', () => {
      const result = utils.getFeedbackForToken({
        token: blank({
          itemIndex: 1,
          value: [{ value: 'prefix' }, { value: 'answer' }],
        }),
        scores: [
          { itemId: 'item-a', target: 1, score: false, expected: 'answer' },
        ],
      })
      expect(result.expected).to.equal('answer')
      expect(result.correctResponse).to.equal('answer')
    })

    for (const correctResponse of [1, '1', /1/]) {
      it(`resolves a select answer from ${String(correctResponse)}`, () => {
        const result = utils.getFeedbackForToken({
          token: blank({
            flavor: Cloze.flavor.select.value,
            value: [{ value: ['first', 'second'] }],
          }),
          scores: [{ itemId: 'item-a', target: 0, correctResponse, score: 0 }],
        })
        expect(result.expected).to.equal('second')
      })
    }

    it('does not invent an expected answer for an invalid select index or empty token', () => {
      for (const correctResponse of ['not-an-index', 0.5, 20]) {
        const result = utils.getFeedbackForToken({
          token: blank({
            flavor: Cloze.flavor.select.value,
            value: [{ value: ['first'] }],
          }),
          scores: [{ itemId: 'item-a', target: 0, correctResponse, score: 0 }],
        })
        expect(result.expected).to.equal(undefined)
      }
      const result = utils.getFeedbackForToken({
        token: blank({ value: [] }),
        scores: [{ itemId: 'item-a', target: 0, score: 0 }],
      })
      expect(result).not.to.have.property('expected')
    })
  })
})
