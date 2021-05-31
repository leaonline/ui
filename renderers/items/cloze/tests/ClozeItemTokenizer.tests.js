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
    it('correctly tokenizes a select value')
  })
  describe(toTokens.name, function () {
    it('allows to map splits to renderable tokens')
  })
})
