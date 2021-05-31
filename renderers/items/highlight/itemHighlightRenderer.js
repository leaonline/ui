import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { ReactiveDict } from 'meteor/reactive-dict'
import { Highlight } from 'meteor/leaonline:corelib/items/highlight/Highlight'
import { createSubmitResponses } from '../utils/createSubmitResponses'
import { dataTarget } from '../../../utils/eventUtils'
import '../../../components/soundbutton/soundbutton'
import './itemHighlightRenderer.css'
import './itemHighlightRenderer.html'

const separatorChars = /[.,;:?!]+/g
const groupPattern = /[{}]+/g

Template.itemHighlightRenderer.onCreated(function () {
  const instance = this
  instance.state = new ReactiveDict()
  instance.responseCache = new ReactiveVar('')
  instance.submitResponse = createSubmitResponses({
    onInput: instance.data.onInput,
    responseCache: {
      get: () => instance.responseCache.get(),
      set: val => instance.responseCache.set(val)
    }
  })

  instance.getResponse = () => {
    const selection = instance.state.get('selection')
    const responses = []
    Object.keys(selection).forEach(index => {
      const value = selection[index]
      if (value) {
        responses.push(index)
      }
    })

    if (responses.length === 0) {
      responses.push('__undefined__')
    }

    return responses
  }

  instance.state.set({
    selection: {},
    color: 'primary',
    hovered: null
  })

  instance.autorun(() => {
    const data = Template.currentData()

    // set the color of the current dimension
    // only if it has been passed with the data
    const { color } = data
    instance.state.set('color', color || 'primary')

    const { value } = data
    if (!value) return

    const { text, tts } = value
    const tokens = [...text.matchAll(Highlight.pattern)]
      .map(token => token[0].replace(groupPattern, ''))
      .map(token => {
        return separatorChars.test(token)
          ? { value: token, isSeparator: true }
          : { value: token }
      })
    instance.state.set({ tokens, ttsText: tts ? text : null })
  })
})

Template.itemHighlightRenderer.helpers({
  tokens () {
    return Template.instance().state.get('tokens')
  },
  tokenAtts (index, token) {
    const instance = Template.instance()
    const color = instance.state.get('color')
    const selection = instance.state.get('selection')
    const hoveredClass = !selection[index] && instance.state.get('hovered') === index ? 'highlight-hovered bg-light' : ''
    const selectedClass = selection[index] ? `highlight-selected px-1 rounded bg-${color}` : ''
    const separatorClass = token.isSeparator ? 'ml-n2' : ''
    return {
      class: `highlight-token ${hoveredClass} ${selectedClass} ${separatorClass}`,
      'data-index': index
    }
  },
  ttsText () {
    return Template.instance().state.get('ttsText')
  }
})

Template.itemHighlightRenderer.events({
  'mouseenter .highlight-token' (event, templateInstance) {
    event.preventDefault()
    const hovered = dataTarget(event, templateInstance, 'index')
    templateInstance.state.set({ hovered })
  },
  'mouseout .highlight-token' (event, templateInstance) {
    event.preventDefault()
    const hovered = null
    templateInstance.state.set({ hovered })
  },
  'click .highlight-token' (event, templateInstance) {
    event.preventDefault()
    const index = dataTarget(event, templateInstance, 'index')
    const selection = templateInstance.state.get('selection')
    selection[index] = !selection[index]
    templateInstance.state.set({ selection })
    templateInstance.submitResponse({
      responses: templateInstance.getResponse(),
      data: templateInstance.data
    })
  }
})
