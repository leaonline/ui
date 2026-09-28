/* eslint-env mocha */

import { expect } from 'chai'
import { ActionButtonUtils } from '../ActionButtonUtils'

describe('ActionButtonUtils', () => {
  describe('getAttributes', () => {
    it('returns the exact minimal button attributes', () => {
      const attributes = ActionButtonUtils.getAttributes({
        data: { title: 'Fallback title' },
      })

      expect(attributes).to.deep.equal({
        id: undefined,
        title: 'Fallback title',
        class:
          'lea-action-button shadow-sm ms-2 btn btn-secondary  lea-text lea-action-btn-secondary   ',
        'aria-label': 'Fallback title',
      })
    })

    it('returns option-rich button attributes without changing class order', () => {
      const attributes = ActionButtonUtils.getAttributes({
        data: {
          id: 'action-id',
          title: 'Action title',
          label: 'Action label',
          type: 'primary',
          outline: true,
          block: true,
          active: true,
          icon: 'check',
          btnClass: 'custom-action',
          href: '/next',
          disabled: true,
          'data-tracking': 'action',
          'data-index': 0,
        },
      })

      expect(attributes).to.deep.equal({
        id: 'action-id',
        title: 'Action title',
        class:
          'lea-action-button shadow-sm ms-2 btn btn-outline-primary w-100 lea-text lea-action-btn-outline-primary active d-flex justify-content-between align-items-center custom-action',
        'aria-label': 'Action label',
        href: '/next',
        disabled: '',
        'data-tracking': 'action',
        'data-index': 0,
      })
    })
  })

  describe('getGroupAttributes', () => {
    it('keeps the sound-enabled wrapper defaults', () => {
      expect(
        ActionButtonUtils.getGroupAttributes({
          data: {
            id: 'action-group',
            title: 'Action group',
            class: 'custom-group',
          },
        }),
      ).to.deep.equal({
        id: 'action-group',
        title: 'Action group',
        class: 'd-flex align-items-center custom-group',
      })
    })

    it('removes only the default wrapper classes when sound is disabled', () => {
      expect(
        ActionButtonUtils.getGroupAttributes({
          data: { sound: false, class: 'custom-group' },
        }),
      ).to.deep.equal({
        id: undefined,
        title: undefined,
        class: ' custom-group',
      })
    })
  })

  describe('getSoundButtonAttributes', () => {
    it('uses the existing sound-button defaults', () => {
      expect(
        ActionButtonUtils.getSoundButtonAttributes({
          data: { label: 'Read this' },
        }),
      ).to.deep.equal({
        tts: undefined,
        text: 'Read this',
        outline: true,
        sm: undefined,
        lg: undefined,
        type: 'secondary',
        active: undefined,
        class: undefined,
      })
    })

    it('forwards explicit sound-button data', () => {
      expect(
        ActionButtonUtils.getSoundButtonAttributes({
          data: {
            tts: 'tts-id',
            text: 'Explicit text',
            label: 'Fallback text',
            outline: false,
            sm: true,
            lg: true,
            type: 'danger',
            active: true,
            sndBtnClass: 'custom-sound',
          },
        }),
      ).to.deep.equal({
        tts: 'tts-id',
        text: 'Explicit text',
        outline: false,
        sm: true,
        lg: true,
        type: 'danger',
        active: true,
        class: 'custom-sound',
      })
    })

    it('returns null when sound is explicitly disabled', () => {
      expect(
        ActionButtonUtils.getSoundButtonAttributes({ data: { sound: false } }),
      ).to.equal(null)
    })
  })

  describe('icon helpers', () => {
    it('retains the original icon-position return values', () => {
      expect(ActionButtonUtils.leftIcon({ data: {} })).to.equal(undefined)
      expect(ActionButtonUtils.rightIcon({ data: {} })).to.equal(undefined)

      expect(ActionButtonUtils.leftIcon({ data: { icon: 'check' } })).to.equal(
        true,
      )
      expect(ActionButtonUtils.rightIcon({ data: { icon: 'check' } })).to.equal(
        false,
      )

      expect(
        ActionButtonUtils.leftIcon({
          data: { icon: 'check', iconPos: 'right' },
        }),
      ).to.equal(false)
      expect(
        ActionButtonUtils.rightIcon({
          data: { icon: 'check', iconPos: 'right' },
        }),
      ).to.equal(true)
    })

    it('falls back only for nullish icon classes', () => {
      expect(
        ActionButtonUtils.iconClass({ data: {}, base: 'base-icon' }),
      ).to.equal('base-icon ')
      expect(
        ActionButtonUtils.iconClass({
          data: { iconClass: null },
          base: 'base-icon',
        }),
      ).to.equal('base-icon ')
      expect(
        ActionButtonUtils.iconClass({
          data: { iconClass: 'custom-icon' },
          base: 'base-icon',
        }),
      ).to.equal('base-icon custom-icon')
    })
  })
})
