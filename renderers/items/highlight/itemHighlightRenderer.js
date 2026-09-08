import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { ReactiveDict } from 'meteor/reactive-dict'
import { Highlight } from 'meteor/leaonline:corelib/items/highlight/Highlight'
import { createSubmitResponses } from '../utils/createSubmitResponses'
import { dataTarget } from '../../../utils/eventUtils'
import { getExplanations } from '../utils/getExplanations'
import '../explanation/itemExplanations'
import '../../../components/soundbutton/soundbutton'
import './itemHighlightRenderer.css'
import './itemHighlightRenderer.html'

const separatorChars = /[.,;:?!]+/g
const groupPattern = /[{}]+/g
const whiteSpace = /^\s+$/

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

    const { value, scores, readOnly } = data
    if (!value) return

    const { text, tts, includeSpace } = value
    const tokens = [...text.matchAll(Highlight.pattern)]
      .map(token => token[0].replace(groupPattern, ''))
      .map(token => {
        return separatorChars.test(token)
          ? { value: token, isSeparator: true }
          : { value: token }
      })

    let scoring = null
    if (scores) {
      const explanations = getExplanations({ scores, value })
      const selection = instance.state.get('selection') ?? []
      scores.forEach(entry => {
        // for each correct response, check if the corresponding token is selected
        const { correctResponse } = entry
        correctResponse.forEach(index => {
          const isSelected = selection[index]
          if (isSelected) {
            tokens[index].validationClass = 'bg-success text-white'
          } else {
            tokens[index].validationClass = 'p-1 rounded border highlight-expected'
          }
        })

        // highlight any selected tokens that are not correct responses
        Object.keys(selection).forEach(index => {
          if (selection[index] && !correctResponse.includes(Number(index))) {
            tokens[index].validationClass = 'bg-danger text-white'
          }
        })
      })
      instance.state.set({ explanations })
    } else {
      instance.state.set({ explanations: null })
    }

    instance.state.set({ scoring, readOnly, tokens, ttsText: tts ? text : null, includeSpace })
  })
})

Template.itemHighlightRenderer.onRendered(function () {
  const instance = this

  instance.autorun(() => {
    const data = Template.currentData()

    // if we have any values cached we need to restore them here, because
    // the choices need to be drawn first, in order to access them
    if (typeof data.onLoad === 'function') {
      const cachedData = data.onLoad(data)

      if (cachedData) {
        const { responses } = cachedData
        instance.state.set('selected', responses)
      }
    }
  })
})

Template.itemHighlightRenderer.helpers({
  tokens () {
    return Template.instance().state.get('tokens')
  },
  tokenAtts (index, token) {
    const instance = Template.instance()
    const readOnly = instance.state.get('readOnly')
    const color = instance.state.get('color')
    const selection = instance.state.get('selection')
    const hoveredClass = !selection[index] && instance.state.get('hovered') == index ? 'highlight-hovered bg-light' : ''
    const selectedClass = selection[index] ? `highlight-selected px-1 rounded ${token.validationClass ? '' : `bg-${color}`}` : ''
    const separatorClass = token.isSeparator ? 'ms-n2' : ''
    const isSpace = whiteSpace.test(token.value)
    const tokenClass = !readOnly && (!isSpace || instance.state.get('includeSpace'))
      ? 'highlight-token'
      : ''
    const validationClass = token.validationClass ? token.validationClass : ''
    return {
      class: `highlight-entry ${tokenClass} ${hoveredClass} ${selectedClass} ${separatorClass} ${validationClass}`,
      'data-index': index,
      'data-isSpace': isSpace
    }
  },
  ttsText () {
    return Template.instance().state.get('ttsText')
  },
  readOnly () {
    return Template.instance().state.get('readOnly')
  },
  explanations () {
    return Template.instance().state.get('explanations')
  }
})

Template.itemHighlightRenderer.events({
  'mouseenter .highlight-token' (event, templateInstance) {
    event.preventDefault()
    const hovered = dataTarget(event, 'index')
    templateInstance.state.set({ hovered })
  },
  'mouseout .highlight-token' (event, templateInstance) {
    event.preventDefault()
    const hovered = null
    templateInstance.state.set({ hovered })
  },
  'click .highlight-token' (event, templateInstance) {
    event.preventDefault()
    const index = dataTarget(event, 'index')
    const selection = templateInstance.state.get('selection')
    selection[index] = !selection[index]
    templateInstance.state.set({ selection })
    templateInstance.submitResponse({
      responses: templateInstance.getResponse(),
      data: templateInstance.data
    })
  }
})
