/* eslint-env mocha */

import { expect } from 'chai'
import { IconUtils } from '../IconUtils'

describe('IconUtils', () => {
  describe('getAttributes', () => {
    ;[
      {
        name: 'the default regular style',
        data: { name: 'book' },
        className: 'fa far  fa-book   ',
      },
      {
        name: 'an explicit regular style',
        data: { name: 'book', far: true },
        className: 'fa far  fa-book   ',
      },
      {
        name: 'an explicit solid style',
        data: { name: 'book', fas: true },
        className: 'fa fas  fa-book   ',
      },
      {
        name: 'regular precedence over solid',
        data: { name: 'book', far: true, fas: true },
        className: 'fa far  fa-book   ',
      },
    ].forEach(({ name, data, className }) => {
      it(`retains ${name}`, () => {
        expect(IconUtils.getAttributes({ data })).to.deep.equal({
          class: className,
          title: undefined,
          'aria-title': undefined,
        })
      })
    })

    it('returns fixed-width, animation, scale, and title attributes', () => {
      expect(
        IconUtils.getAttributes({
          data: {
            name: 'volume-up',
            far: true,
            fas: true,
            fw: true,
            pulse: true,
            spin: true,
            scale: 2,
            title: 'Listen',
          },
        }),
      ).to.deep.equal({
        class: 'fa far fa-fw fa-volume-up fa-pulse fa-spin fa-2x',
        title: 'Listen',
        'aria-title': 'Listen',
      })
    })
  })
})
