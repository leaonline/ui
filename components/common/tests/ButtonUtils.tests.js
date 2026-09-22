/* eslint-env mocha */

import { expect } from 'chai'
import { ButtonUtils } from '../ButtonUtils'

describe('ButtonUtils', () => {
  ;[
    {
      name: 'a missing icon',
      data: undefined,
      left: undefined,
      right: undefined,
    },
    {
      name: 'the default icon position',
      data: { icon: 'check' },
      left: true,
      right: false,
    },
    {
      name: 'an explicit left icon',
      data: { icon: 'check', iconPos: 'left' },
      left: true,
      right: false,
    },
    {
      name: 'an explicit right icon',
      data: { icon: 'check', iconPos: 'right' },
      left: false,
      right: true,
    },
  ].forEach(({ name, data, left, right }) => {
    it(`retains exact return values for ${name}`, () => {
      expect(ButtonUtils.leftIcon(data)).to.equal(left)
      expect(ButtonUtils.rightIcon(data)).to.equal(right)
    })
  })
})
