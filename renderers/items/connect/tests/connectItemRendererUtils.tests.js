import { expect } from 'chai'
import { ConnectItemRendererUtils } from '../ConnectItemRendererUtils'

describe('ConnectItemRendererUtils', () => {
  describe('createLine', () => {
    it('returns null if no root node is given', () => {
      const inputs = [null, undefined, {}, () => {}]
      for (const root of inputs) {
        expect(ConnectItemRendererUtils.createLine({ root })).to.equal(null)
      }
    })
    it('calculates a line from point a to point b')
  })
})
