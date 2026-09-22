/* eslint-env mocha */

import { expect } from 'chai'
import { RouteButtonUtils } from '../RouteButtonUtils'

describe('RouteButtonUtils', () => {
  describe('getAttributes', () => {
    it('returns the exact minimal ungrouped link attributes', () => {
      const attributes = RouteButtonUtils.getAttributes({
        data: { title: 'Fallback title' },
      })

      expect(attributes).to.deep.equal({
        id: undefined,
        title: 'Fallback title',
        class:
          'lea-route-button shadow-sm ms-2 ms-2  btn btn-secondary  lea-text lea-route-btn-secondary    ',
        'aria-label': 'Fallback title',
        href: '',
      })
    })

    it('returns option-rich grouped link attributes in the original order', () => {
      const attributes = RouteButtonUtils.getAttributes({
        data: {
          id: 'route-id',
          title: 'Route title',
          label: 'Route label',
          href: '/destination',
          target: '_blank',
          type: 'danger',
          outline: true,
          group: true,
          block: true,
          sm: true,
          lg: true,
          active: true,
          btnClass: 'custom-route',
          'data-tracking': 'route',
          'data-index': 0,
        },
      })

      expect(attributes).to.deep.equal({
        id: 'route-id',
        title: 'Route title',
        class:
          'lea-route-button shadow-sm ms-2  btn btn-outline-danger w-100 lea-text lea-route-btn-outline-danger btn-sm btn-lg active custom-route',
        'aria-label': 'Route label',
        href: '/destination',
        target: '_blank',
        'data-tracking': 'route',
        'data-index': 0,
      })
    })
  })

  describe('getGroupAttributes', () => {
    it('keeps the ungrouped sound-enabled wrapper contract', () => {
      expect(
        RouteButtonUtils.getGroupAttributes({
          data: { title: 'Route group' },
        }),
      ).to.deep.equal({
        id: undefined,
        title: 'Route group',
        class: 'd-flex align-items-center  ',
      })
    })

    it('adds grouped wrapper classes and role with sound disabled', () => {
      expect(
        RouteButtonUtils.getGroupAttributes({
          data: {
            id: 'route-group',
            title: 'Route group',
            group: true,
            sound: false,
            class: 'custom-group',
          },
        }),
      ).to.deep.equal({
        id: 'route-group',
        title: 'Route group',
        class: ' btn-group custom-group',
        role: 'group',
      })
    })
  })
})
