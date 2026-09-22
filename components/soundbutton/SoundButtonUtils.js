import { getBsType } from '../../utils/bootstrapUtils'

export const SoundButtonUtils = {}

SoundButtonUtils.getAttributes = ({ data, ttsReady }) => {
  const initialTTS = data.tts
  const initialText = data.text
  const disabled = data.disabled || !ttsReady
  const btnType = getBsType(data.type, data.outline)
  const btnBlock = data.block ? 'd-block w-100' : ''
  const btnSize = (data.sm && 'btn-sm') || (data.lg && 'btn-lg') || ''
  const customClass = data.class || ''
  const disabledClass = disabled ? 'disabled' : ''
  const activeClass = data.active ? 'active' : ''
  const borderClass = data.border || data.outline === false ? '' : 'border-0'

  return {
    id: data.id,
    title: data.title,
    disabled: disabled,
    type: 'button',
    class: `lea-sound-btn align-baseline p-1 d-print-none btn btn-${btnType} ${btnBlock} ${btnSize} ${borderClass} ${activeClass} ${customClass} ${disabledClass}`,
    'data-tts': initialTTS,
    'data-text': initialText,
    'aria-label': data.title,
  }
}
