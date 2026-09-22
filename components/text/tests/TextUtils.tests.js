/* eslint-env mocha */

import { expect } from 'chai'
import { TextUtils } from '../TextUtils'

describe('TextUtils', () => {
  describe('getAttributes', () => {
    it('returns the regular wrapper classes with the empty fallback', () => {
      expect(TextUtils.getAttributes({ data: {} })).to.deep.equal({
        class: 'lea-text text-wrapper ',
      })
    })

    it('returns bold and custom wrapper classes', () => {
      expect(
        TextUtils.getAttributes({
          data: { bold: true, class: 'custom-text' },
        }),
      ).to.deep.equal({
        class: 'lea-text-bold text-wrapper custom-text',
      })
    })
  })

  describe('getTokens', () => {
    ;[
      { src: 'alpha beta', expected: ['alpha', 'beta'] },
      { src: 'alpha   beta', expected: ['alpha', 'beta'] },
      { src: ' alpha', expected: ['', 'alpha'] },
      { src: 'alpha ', expected: ['alpha', ''] },
    ].forEach(({ src, expected }) => {
      it(`preserves splitting behavior for ${JSON.stringify(src)}`, () => {
        expect(TextUtils.getTokens({ data: { src } })).to.deep.equal(expected)
      })
    })
  })
})
