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
    it('calculates endpoints and the remove-button position relative to the root', () => {
      const source = { left: 120, top: 80, width: 40, height: 20 }
      const target = { left: 300, top: 140, width: 60, height: 40 }
      const root = {
        getBoundingClientRect: () => ({
          left: 100,
          top: 50,
          width: 500,
          height: 300,
        }),
      }
      expect(
        ConnectItemRendererUtils.createLine({
          root,
          source,
          target,
          from: '0',
          to: '2',
          color: 'red',
        }),
      ).to.deep.equal({
        from: '0',
        to: '2',
        x1: 70,
        y1: 40,
        x2: 200,
        y2: 110,
        cx: 135,
        cy: 65,
        color: 'red',
        width: 500,
        height: 300,
      })
      expect(source).to.deep.equal({
        left: 120,
        top: 80,
        width: 40,
        height: 20,
      })
      expect(target).to.deep.equal({
        left: 300,
        top: 140,
        width: 60,
        height: 40,
      })
    })

    it('preserves fractional positions and zero-valued indexes', () => {
      const root = {
        getBoundingClientRect: () => ({
          left: 10.5,
          top: 20.5,
          width: 200.5,
          height: 100.5,
        }),
      }
      const source = { left: 0, top: 0, width: 1, height: 1 }
      const target = { left: 2, top: 4, width: 1, height: 1 }
      expect(
        ConnectItemRendererUtils.createLine({
          root,
          source,
          target,
          from: 0,
          to: 0,
        }),
      ).to.deep.equal({
        from: 0,
        to: 0,
        x1: 0.5,
        y1: -20,
        x2: -8.5,
        y2: -16,
        cx: -4,
        cy: -28,
        color: undefined,
        width: 200.5,
        height: 100.5,
      })
    })
  })
})
