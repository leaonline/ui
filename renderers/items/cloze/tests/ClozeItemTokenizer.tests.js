/* eslint-env mocha */
import {
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
      expect(toTokens({ value: '//'})).to.deep.equal({ value: '//', isNewLine: true })
      expect(toTokens({ value: 'noseparator'})).to.deep.equal({ value: 'noseparator'})
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
            value: ['foo', 'baz' ]
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
})
