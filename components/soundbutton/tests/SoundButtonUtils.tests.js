/* eslint-env mocha */

import { expect } from 'chai'
import { SoundButtonUtils } from '../SoundButtonUtils'

describe('SoundButtonUtils', () => {
  describe('getAttributes', () => {
    it('returns the exact minimal ready-state attributes', () => {
      const attributes = SoundButtonUtils.getAttributes({
        data: { title: 'Read aloud' },
        ttsReady: true,
      })

      expect(attributes).to.deep.equal({
        id: undefined,
        title: 'Read aloud',
        disabled: false,
        type: 'button',
        class:
          'lea-sound-btn align-baseline p-1 d-print-none btn btn-secondary   border-0   ',
        'data-tts': undefined,
        'data-text': undefined,
        'aria-label': 'Read aloud',
      })
    })

    it('returns option-rich attributes and prefers sm over lg', () => {
      const attributes = SoundButtonUtils.getAttributes({
        data: {
          id: 'sound-id',
          title: 'Play instructions',
          disabled: true,
          tts: 'tts-id',
          text: 'Instructions',
          type: 'primary',
          outline: true,
          block: true,
          sm: true,
          lg: true,
          border: true,
          active: true,
          class: 'custom-sound',
        },
        ttsReady: true,
      })

      expect(attributes).to.deep.equal({
        id: 'sound-id',
        title: 'Play instructions',
        disabled: true,
        type: 'button',
        class:
          'lea-sound-btn align-baseline p-1 d-print-none btn btn-outline-primary d-block w-100 btn-sm  active custom-sound disabled',
        'data-tts': 'tts-id',
        'data-text': 'Instructions',
        'aria-label': 'Play instructions',
      })
    })

    it('preserves the tts-ready and explicit-disabled matrix', () => {
      const cases = [
        { ttsReady: true, disabled: undefined, expected: false },
        { ttsReady: true, disabled: false, expected: false },
        { ttsReady: true, disabled: true, expected: true },
        { ttsReady: false, disabled: undefined, expected: true },
        { ttsReady: false, disabled: false, expected: true },
        { ttsReady: false, disabled: true, expected: true },
      ]

      cases.forEach(({ ttsReady, disabled, expected }) => {
        const attributes = SoundButtonUtils.getAttributes({
          data: { disabled },
          ttsReady,
        })
        expect(attributes.disabled).to.equal(expected)
      })
    })

    it('retains outline and border precedence', () => {
      const outlined = SoundButtonUtils.getAttributes({
        data: { type: 'info', outline: true },
        ttsReady: true,
      })
      const plain = SoundButtonUtils.getAttributes({
        data: { type: 'info', outline: false },
        ttsReady: true,
      })
      const bordered = SoundButtonUtils.getAttributes({
        data: { type: 'info', outline: true, border: true },
        ttsReady: true,
      })

      expect(outlined.class).to.include('btn-outline-info')
      expect(outlined.class).to.include('border-0')
      expect(plain.class).to.include('btn-info')
      expect(plain.class).not.to.include('border-0')
      expect(bordered.class).to.include('btn-outline-info')
      expect(bordered.class).not.to.include('border-0')
    })
  })
})
