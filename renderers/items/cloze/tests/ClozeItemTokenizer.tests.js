/* eslint-env mocha */
import { Random } from 'meteor/random'
import {
  ClozeItemTokenizer,
  tokenizeBlanks,
  tokenizeSelect,
  tokenizeText,
  toTokens,
  getTokenValueForFlavor
} from '../utils/ClozeItemTokenizer'
import { expect } from 'chai'

describe('ClozeItemTokenizer', function () {
  describe(getTokenValueForFlavor.name, function () {
    it('throws on undefined flavour', function () {
      [-1, 0, 5, true, false, {}, undefined, null].forEach(flavor => {
        expect(() => getTokenValueForFlavor(flavor))
          .to.throw(`Unexpected flavor: ${flavor}`)
      })
    })
  })
  describe(tokenizeBlanks.name, function () {
    it('it splits a blanks value into the correct tokens', function () {
      const flavor = '99'

      expect(tokenizeBlanks(flavor, '[foo]')).to.deep.equal([{
        hasPre: false,
        hasSuf: false,
        flavor: flavor,
        isToken: true,
        index: 0,
        length: 3,
        value: 'foo'
      }])

      expect(tokenizeBlanks(flavor, 'ha [foo] bar')).to.deep.equal([{
        index: 0,
        length: 3,
        value: 'ha '
      }, {
        hasPre: true,
        hasSuf: true,
        flavor: flavor,
        isToken: true,
        index: 1,
        length: 3,
        value: 'foo'
      }, {
        index: 2,
        length: 4,
        value: ' bar'
      }])
    })
    it('it splits a empty value into the correct tokens', function () {
      const flavor = '99'

      expect(tokenizeBlanks(flavor, '[foo]')).to.deep.equal([{
        hasPre: false,
        hasSuf: false,
        flavor: flavor,
        isToken: true,
        index: 0,
        length: 3,
        value: 'foo'
      }])

      expect(tokenizeBlanks(flavor, 'ha [foo] bar')).to.deep.equal([{
        index: 0,
        length: 3,
        value: 'ha '
      }, {
        hasPre: true,
        hasSuf: true,
        flavor: flavor,
        isToken: true,
        index: 1,
        length: 3,
        value: 'foo'
      }, {
        index: 2,
        length: 4,
        value: ' bar'
      }])
    })
  })
  describe(tokenizeSelect.name, function () {
    it('correctly tokenizes a select value', function () {
      const flavor = '99'

      expect(tokenizeSelect(flavor, '[foo|bar]')).to.deep.equal([{
        hasPre: false,
        hasSuf: false,
        flavor: flavor,
        isToken: true,
        index: 0,
        length: 7,
        value: ['foo', 'bar']
      }])

      expect(tokenizeSelect(flavor, 'ha [foo|bar|baz] bar')).to.deep.equal([{
        index: 0,
        length: 3,
        value: 'ha '
      }, {
        hasPre: true,
        hasSuf: true,
        flavor: flavor,
        isToken: true,
        index: 1,
        length: 11,
        value: ['foo', 'bar', 'baz']
      }, {
        index: 2,
        length: 4,
        value: ' bar'
      }])
    })
  })
  describe(tokenizeText.name, function () {
    it('it splits a text value into the correct tokens', function () {
      const flavor = '99'

      expect(tokenizeText(flavor, '[foo]')).to.deep.equal([{
        hasPre: false,
        hasSuf: false,
        flavor: flavor,
        isToken: true,
        index: 0,
        length: 3,
        value: 'foo'
      }])

      expect(tokenizeText(flavor, 'ha [foo] bar')).to.deep.equal([{
        index: 0,
        length: 3,
        value: 'ha '
      }, {
        hasPre: false,
        hasSuf: false,
        flavor: flavor,
        isToken: true,
        index: 1,
        length: 3,
        value: 'foo'
      }, {
        index: 2,
        length: 4,
        value: ' bar'
      }])
    })
  })
  describe(toTokens.name, function () {
    let itemId
    let fn
    beforeEach(() => {
      itemId = Random.id(6)
      fn = toTokens({ itemId })
    })
    it('throws on unexpected flavour', function () {
      const flavour = Math.random().toString(16)
      expect(() => fn({ value: `${flavour}$foo$bar` }))
        .to.throw(`Unexpected flavor - ${flavour}`)
    })
    it('allows to map splits to renderable tokens', function () {
      expect(fn({ value: '//' })).to.deep.equal({
        value: '//',
        isNewLine: true,
        itemId
      })
      expect(fn({ value: 'noseparator' })).to.deep.equal({ itemId, value: 'noseparator' })
      expect(fn({ value: 'blanks$foo$bar' })).to.deep.equal({
        itemId,
        flavor: 2,
        isBlock: false,
        tts: 'bar',
        value: [
          {
            index: 0,
            length: 3,
            value: 'foo'
          }
        ]
      })
      expect(fn({ value: 'blanks$[foo]$bar' })).to.deep.equal({
        itemId,
        flavor: 2,
        isBlock: false,
        tts: 'bar',
        value: [
          {
            flavor: 2,
            hasPre: false,
            hasSuf: false,
            index: 0,
            isToken: true,
            length: 3,
            value: 'foo'
          }
        ]
      })
      expect(fn({ value: 'select$[foo|baz]$bar' })).to.deep.equal({
        itemId,
        flavor: 1,
        isBlock: false,
        tts: 'bar',
        value: [
          {
            flavor: 1,
            hasPre: false,
            hasSuf: false,
            index: 0,
            isToken: true,
            length: 7,
            value: ['foo', 'baz']
          }
        ]
      })
      expect(fn({ value: 'empty$[foo]$bar' })).to.deep.equal({
        itemId,
        flavor: 3,
        isBlock: false,
        tts: 'bar',
        value: [{
          flavor: 3,
          hasPre: false,
          hasSuf: false,
          index: 0,
          isToken: true,
          length: 3,
          value: 'foo'
        }
        ]
      })
      expect(fn({ value: 'text$[foo]$bar' })).to.deep.equal({
        itemId,
        flavor: 4,
        isBlock: false,
        tts: 'bar',
        value: [
          {
            flavor: 4,
            hasPre: false,
            hasSuf: false,
            index: 0,
            isToken: true,
            length: 3,
            value: 'foo'
          }
        ]
      })
    })
    it('supports options but optional', function () {
      expect(fn({ value: 'blanks$foo$bar$color=primary' })).to.deep.equal({
        itemId,
        flavor: 2,
        isBlock: false,
        tts: 'bar',
        color: 'primary',
        value: [
          {
            index: 0,
            length: 3,
            value: 'foo'
          }
        ]
      })

      // multiple split by &
      expect(fn({ value: 'blanks$foo$bar$color=primary&border=dark' })).to.deep.equal({
        itemId,
        flavor: 2,
        isBlock: false,
        tts: 'bar',
        color: 'primary',
        border: 'dark',
        value: [
          {
            index: 0,
            length: 3,
            value: 'foo'
          }
        ]
      })
    })
  })

  describe(ClozeItemTokenizer.tokenize.name, function () {
    let itemId
    beforeEach(() => {
      itemId = Random.id(6)
    })
    it('tokenizes a default cloze text correctly', function () {
      const text = `{{blanks$[L]iebe$Liebe}} Frau Lang, 
{{blanks$[L]ara$Lara}} ist {{blanks$[h]eute$heute}} leider krank.`

      const tokens = ClozeItemTokenizer.tokenize({ itemId, text })
      expect(tokens).to.deep.equal([{
        value: '',
        length: 0,
        isEmpty: true,
        index: 0,
        itemId
      }, {
        itemId,
        isToken: true,
        value: [{
          isToken: true,
          value: 'L',
          length: 1,
          index: 0,
          hasPre: false,
          hasSuf: true,
          flavor: 2
        },
        {
          value: 'iebe',
          length: 4,
          index: 1
        }
        ],
        length: 20,
        index: 1,
        flavor: 2,
        tts: 'Liebe',
        isBlock: false
      },
      {
        itemId,
        value: ' Frau Lang, ',
        length: 12,
        index: 2
      },
      {
        itemId,
        isToken: true,
        value: '//',
        length: 2,
        index: 3,
        isNewLine: true
      },
      {
        itemId,
        value: '',
        length: 0,
        isEmpty: true,
        index: 4
      },
      {
        itemId,
        isToken: true,
        value: [{
          isToken: true,
          value: 'L',
          length: 1,
          index: 0,
          hasPre: false,
          hasSuf: true,
          flavor: 2
        },
        {
          value: 'ara',
          length: 3,
          index: 1
        }
        ],
        length: 18,
        index: 5,
        flavor: 2,
        tts: 'Lara',
        isBlock: false
      },
      {
        itemId,
        value: ' ist ',
        length: 5,
        index: 6
      },
      {
        itemId,
        isToken: true,
        value: [
          {
            isToken: true,
            value: 'h',
            length: 1,
            index: 0,
            hasPre: false,
            hasSuf: true,
            flavor: 2
          },
          {
            value: 'eute',
            length: 4,
            index: 1
          }
        ],
        length: 20,
        index: 7,
        flavor: 2,
        tts: 'heute',
        isBlock: false
      },
      {
        itemId,
        value: ' leider krank.',
        length: 14,
        index: 8
      }
      ])
    })
    it('tokenizes a cloze text in table mode correctly', function () {
      const text = `Die Zahl:  || 41 || {{blanks$[26]$}} || 19 || {{blanks$[21]$}} || {{blanks$[44]$}}           
Das Doppelte: || {{blanks$[82]$}} || 52  || {{blanks$[38]$}} || 42 || 88`
      const tokens = ClozeItemTokenizer.tokenize({ itemId, text, isTable: true })
      expect(tokens).to.deep.equal([[{
        itemId,
        value: 'Die Zahl:',
        length: 9,
        index: 0
      }, { itemId, value: '41', length: 2, index: 0 }, { // ||
        itemId,
        isToken: true,
        value: [{
          isToken: true,
          value: '26',
          length: 2,
          index: 0,
          hasPre: false,
          hasSuf: false,
          flavor: 2
        }],
        length: 12,
        index: 1,
        flavor: 2,
        tts: '',
        isBlock: false
      }, { itemId, value: '19', length: 2, index: 0 }, { // ||
        itemId,
        isToken: true,
        value: [{
          isToken: true,
          value: '21',
          length: 2,
          index: 0,
          hasPre: false,
          hasSuf: false,
          flavor: 2
        }],
        length: 12,
        index: 1,
        flavor: 2,
        tts: '',
        isBlock: false
      }, {
        itemId,
        isToken: true,
        value: [{
          isToken: true,
          value: '44',
          length: 2,
          index: 0,
          hasPre: false,
          hasSuf: false,
          flavor: 2
        }],
        length: 12,
        index: 1,
        flavor: 2,
        tts: '',
        isBlock: false
      }], [{
        itemId,
        value: 'Das Doppelte:',
        length: 13,
        index: 0
      }, {
        itemId,
        isToken: true,
        value: [{
          isToken: true,
          value: '82',
          length: 2,
          index: 0,
          hasPre: false,
          hasSuf: false,
          flavor: 2
        }],
        length: 12,
        index: 1,
        flavor: 2,
        tts: '',
        isBlock: false
      }, {itemId,  value: '52', length: 2, index: 0 }, { // ||
        itemId,
        isToken: true,
        value: [{
          isToken: true,
          value: '38',
          length: 2,
          index: 0,
          hasPre: false,
          hasSuf: false,
          flavor: 2
        }],
        length: 12,
        index: 1,
        flavor: 2,
        tts: '',
        isBlock: false
      }, { itemId, value: '42', length: 2, index: 0 }, { // ||
        itemId,
        value: '88',
        length: 2,
        index: 0
      }]])
    })
  })
})
