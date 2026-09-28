import { expect } from 'chai'
import { DocumentRendererUtils } from '../DocumentRendererUtils'

describe('DocumentRendererUtils', () => {
  describe('replacer', () => {
    it('parses inline JSON objects, arrays and primitive values', () => {
      const replace = DocumentRendererUtils.replacer()
      for (const [input, expected] of [
        ['{"value":1}', { value: 1 }],
        ['[1,false,null]', [1, false, null]],
        ['42', 42],
        ['true', true],
        ['null', null],
        ['"quoted"', 'quoted'],
      ]) {
        expect(replace('field', input)).to.deep.equal(expected)
      }
    })

    it('ignores unparseable inline strings', () => {
      const replace = DocumentRendererUtils.replacer()
      for (const value of ['', 'plain text', '{invalid}', '01']) {
        expect(replace('field', value)).to.equal(value)
      }
    })

    it('splits newlines and removes indentation after the break', () => {
      const replace = DocumentRendererUtils.replacer()
      expect(replace('field', 'first\n  second\n\tthird')).to.deep.equal([
        'first',
        'second',
        'third',
      ])
      expect(replace('field', '"first\\nsecond"')).to.deep.equal([
        'first',
        'second',
      ])
    })

    it('returns non-string values unchanged', () => {
      const replace = DocumentRendererUtils.replacer()
      for (const value of [undefined, null, false, true, 0, 42, [], {}]) {
        expect(replace('field', value)).to.equal(value)
      }
    })

    it('recursively converts document fields without mutating the document', () => {
      const doc = { nested: '{"value":"[1,2]"}', lines: 'a\nb' }
      const json = JSON.stringify(doc, DocumentRendererUtils.replacer())
      expect(JSON.parse(json)).to.deep.equal({
        nested: { value: [1, 2] },
        lines: ['a', 'b'],
      })
      expect(doc).to.deep.equal({ nested: '{"value":"[1,2]"}', lines: 'a\nb' })
    })
  })
})
