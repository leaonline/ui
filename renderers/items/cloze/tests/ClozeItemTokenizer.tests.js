/* eslint-env mocha */
import {
  ClozeItemTokenizer,
  // ClozeItemTokenizer,
  tokenizeBlanks,
  tokenizeSelect,
  toTokens
} from '../utils/ClozeItemTokenizer'
import { expect } from 'chai'

describe('ClozeItemTokenizer', function () {
  describe(tokenizeBlanks.name, function () {
    it('it splits a value into the correct tokens', function () {
      const flavor = '99'

      expect(tokenizeBlanks(flavor, '[foo]')).to.deep.equal([{
        index: 0,
        length: 0,
        value: ''
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
        length: 0,
        value: ''
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
        index: 0,
        length: 0,
        value: ''
      }, {
        hasPre: true,
        hasSuf: true,
        flavor: flavor,
        isToken: true,
        index: 1,
        length: 7,
        value: ['foo', 'bar']
      }, {
        index: 2,
        length: 0,
        value: ''
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
  describe(toTokens.name, function () {
    it('allows to map splits to renderable tokens', function () {
      expect(toTokens({ value: '//' })).to.deep.equal({
        value: '//',
        isNewLine: true
      })
      expect(toTokens({ value: 'noseparator' })).to.deep.equal({ value: 'noseparator' })
      expect(toTokens({ value: 'blanks$foo$bar' })).to.deep.equal({
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

      expect(toTokens({ value: 'blanks$[foo]$bar' })).to.deep.equal({
        flavor: 2,
        isBlock: false,
        tts: 'bar',
        value: [
          {
            index: 0,
            length: 0,
            value: ''
          },
          {
            flavor: 2,
            hasPre: true,
            hasSuf: true,
            index: 1,
            isToken: true,
            length: 3,
            value: 'foo'
          },
          {
            index: 2,
            length: 0,
            value: ''
          }
        ]
      })

      expect(toTokens({ value: 'select$[foo|baz]$bar' })).to.deep.equal({
        flavor: 1,
        isBlock: false,
        tts: 'bar',
        value: [
          {
            index: 0,
            length: 0,
            value: ''
          },
          {
            flavor: 1,
            hasPre: true,
            hasSuf: true,
            index: 1,
            isToken: true,
            length: 7,
            value: ['foo', 'baz']
          },
          {
            index: 2,
            length: 0,
            value: ''
          }
        ]
      })
    })
  })

  describe(ClozeItemTokenizer.tokenize.name, function () {
    it('tokenizes a default cloze text correctly', function () {
      const text = `{{blanks$[L]iebe$Liebe}} Frau Lang, 
{{blanks$[L]ara$Lara}} ist {{blanks$[h]eute$heute}} leider krank.`

      const tokens = ClozeItemTokenizer.tokenize({ text })
      expect(tokens).to.deep.equal([
        {
          value: '',
          length: 0,
          index: 0
        },
        {
          isToken: true,
          value: [
            {
              value: '',
              length: 0,
              index: 0
            },
            {
              isToken: true,
              value: 'L',
              length: 1,
              index: 1,
              hasPre: true,
              hasSuf: true,
              flavor: 2
            },
            {
              value: 'iebe',
              length: 4,
              index: 2
            }
          ],
          length: 20,
          index: 1,
          flavor: 2,
          tts: 'Liebe',
          isBlock: false
        },
        {
          value: ' Frau Lang, ',
          length: 12,
          index: 2
        },
        {
          isToken: true,
          value: '//',
          length: 2,
          index: 3,
          isNewLine: true
        },
        {
          value: '',
          length: 0,
          index: 4
        },
        {
          isToken: true,
          value: [
            {
              value: '',
              length: 0,
              index: 0
            },
            {
              isToken: true,
              value: 'L',
              length: 1,
              index: 1,
              hasPre: true,
              hasSuf: true,
              flavor: 2
            },
            {
              value: 'ara',
              length: 3,
              index: 2
            }
          ],
          length: 18,
          index: 5,
          flavor: 2,
          tts: 'Lara',
          isBlock: false
        },
        {
          value: ' ist ',
          length: 5,
          index: 6
        },
        {
          isToken: true,
          value: [
            {
              value: '',
              length: 0,
              index: 0
            },
            {
              isToken: true,
              value: 'h',
              length: 1,
              index: 1,
              hasPre: true,
              hasSuf: true,
              flavor: 2
            },
            {
              value: 'eute',
              length: 4,
              index: 2
            }
          ],
          length: 20,
          index: 7,
          flavor: 2,
          tts: 'heute',
          isBlock: false
        },
        {
          value: ' leider krank.',
          length: 14,
          index: 8
        }
      ])
    })
    it('tokenizes a cloze text in table mode correctly', function () {
      const text = `Die Zahl:  || 41 || {{blanks$[26]$}} || 19 || {{blanks$[21]$}} || {{blanks$[44]$}}           
Das Doppelte: || {{blanks$[82]$}} || 52  || {{blanks$[38]$}} || 42 || 88`
      const tokens = ClozeItemTokenizer.tokenize({ text, isTable: true })
      expect(tokens).to.deep.equal([[{
        value: 'Die Zahl:',
        length: 9,
        index: 0
      }, { value: '41', length: 2, index: 0 }, {
        isToken: true,
        value: [{ value: '', length: 0, index: 0 }, {
          isToken: true,
          value: '26',
          length: 2,
          index: 1,
          hasPre: true,
          hasSuf: true,
          flavor: 2
        }, { value: '', length: 0, index: 2 }],
        length: 12,
        index: 1,
        flavor: 2,
        tts: '',
        isBlock: false
      }, { value: '19', length: 2, index: 0 }, {
        isToken: true,
        value: [{ value: '', length: 0, index: 0 }, {
          isToken: true,
          value: '21',
          length: 2,
          index: 1,
          hasPre: true,
          hasSuf: true,
          flavor: 2
        }, { value: '', length: 0, index: 2 }],
        length: 12,
        index: 1,
        flavor: 2,
        tts: '',
        isBlock: false
      }, {
        isToken: true,
        value: [{ value: '', length: 0, index: 0 }, {
          isToken: true,
          value: '44',
          length: 2,
          index: 1,
          hasPre: true,
          hasSuf: true,
          flavor: 2
        }, { value: '', length: 0, index: 2 }],
        length: 12,
        index: 1,
        flavor: 2,
        tts: '',
        isBlock: false
      }], [{
        value: 'Das Doppelte:',
        length: 13,
        index: 0
      }, {
        isToken: true,
        value: [{ value: '', length: 0, index: 0 }, {
          isToken: true,
          value: '82',
          length: 2,
          index: 1,
          hasPre: true,
          hasSuf: true,
          flavor: 2
        }, { value: '', length: 0, index: 2 }],
        length: 12,
        index: 1,
        flavor: 2,
        tts: '',
        isBlock: false
      }, { value: '52', length: 2, index: 0 }, {
        isToken: true,
        value: [{ value: '', length: 0, index: 0 }, {
          isToken: true,
          value: '38',
          length: 2,
          index: 1,
          hasPre: true,
          hasSuf: true,
          flavor: 2
        }, { value: '', length: 0, index: 2 }],
        length: 12,
        index: 1,
        flavor: 2,
        tts: '',
        isBlock: false
      }, { value: '42', length: 2, index: 0 }, {
        value: '88',
        length: 2,
        index: 0
      }]])
    })
  })
})
