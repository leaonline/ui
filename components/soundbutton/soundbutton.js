import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { TTSEngine } from 'meteor/leaonline:corelib/tts/TTSEngine'
import { getBsType } from '../../utils/bootstrapUtils'
import './soundbutton.html'

Template.soundbutton.onCreated(function () {
  const instance = this

  instance.autorun(() => {
    const reactiveData = Template.currentData()
    updateAtts(reactiveData, instance)

    const reactiveTTS = (reactiveData.tts || reactiveData.text)
    const currentTTS = (instance.tts.get() || instance.text.get())

    if (reactiveTTS !== currentTTS) {
      // if the TTS target changed reactively
      // we need to stop the current playing
      if (instance.isPlaying.get()) {
        TTSEngine.stop()
      }
      // we need to update the internal
      // TTS target state to allow playing the new sound
      instance.tts.set(reactiveData.tts)
      instance.text.set(reactiveData.text)
    }
  })
})

function updateAtts (data, instance) {
  const initialTTS = data.tts
  const initialText = data.text

  const btnType = getBsType(data.type, data.outline)
  const btnBlock = data.block ? 'btn-block' : ''
  const btnSize = (data.sm && 'btn-sm') || (data.lg && 'btn-lg') || ''
  const customClass = data.class || ''
  const activeClass = data.active ? 'active' : ''
  const borderClass = (data.border || data.outline === false)
    ? ''
    : 'border-0'

  instance.isPlaying = new ReactiveVar(false)
  instance.tts = new ReactiveVar(initialTTS)
  instance.text = new ReactiveVar(initialText)

  instance.attributes = new ReactiveVar({
    id: data.id,
    title: data.title,
    disabled: data.disabled || !TTSEngine.isAvailable(),
    type: 'button',
    class: `lea-sound-btn d-print-none btn btn-${btnType} ${btnBlock} ${btnSize} ${borderClass} ${activeClass} ${customClass}`,
    'data-tts': initialTTS,
    'data-text': initialText,
    'aria-label': data.title
  })
}

Template.soundbutton.onDestroyed(function () {
  const instance = this
  const isPlaying = instance.isPlaying.get()

  if (isPlaying) {
    TTSEngine.stop()
  }
})

Template.soundbutton.helpers({
  attributes () {
    const instance = Template.instance()
    const isPlaying = instance.isPlaying.get()
    const atts = Object.assign({}, instance.attributes.get())

    if (isPlaying || instance.data.active) {
      atts.class += ' active'
    }
    atts['data-tts'] = instance.tts.get()
    atts['data-text'] = instance.text.get()
    atts['aria-hidden'] = true
    return atts
  },
  isPlaying () {
    return Template.instance().isPlaying.get()
  }
})

Template.soundbutton.events({
  'click .lea-sound-btn' (event, templateInstance) {
    event.preventDefault()
    event.stopPropagation()

    const isPlaying = templateInstance.isPlaying.get()

    if (isPlaying) {
      TTSEngine.stop()
      templateInstance.isPlaying.set(false)
      return
    }

    const $target = templateInstance.$(event.currentTarget)
    const id = $target.data('tts')
    const text = $target.data('text')
    const onEnd = () => templateInstance.isPlaying.set(false)
    if (id || text) {
      try {
        TTSEngine.play({ id, text, onEnd })
        templateInstance.isPlaying.set(true)
      } catch (e) {
        console.error(e)
        // TODO noitfy?
      }
    }
  }
})
