import { Template } from 'meteor/templating'
import { ReactiveDict } from 'meteor/reactive-dict'
import { ReactiveVar } from 'meteor/reactive-var'
import './itemHighlightRenderer.css'
import './itemHighlightRenderer.html'
import '../../../components/soundbutton/soundbutton'
import { dataTarget } from '../../../utils/eventUtils'

const whiteSpace = /\s+/g
const separatorChars = /[.,;:?!]+/g
const insertWhiteSpace = (str, index) => `${str.substr(0, index)} ${str.substr(index)}`

Template.itemHighlightRenderer.onCreated(function () {
  const instance = this
  instance.state = new ReactiveDict()
  instance.responseCache = new ReactiveVar('')

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
    const tokens = text.split(whiteSpace)
      .map(token => {
        const separatorIndex = token.search(separatorChars)
        if (separatorIndex === -1) return token
        return insertWhiteSpace(token, separatorIndex).split(whiteSpace)
      })
      .flat()
      .map(token => {
        return separatorChars.test(token)
          ? { value: token, isSeparator: true }
          : { value: token }
      })
    instance.state.set({ tokens, ttsText: tts ? text : null })
  })
})

Template.itemHighlightRenderer.onRendered(function () {
  const instance = this
  submitValues(instance)
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
    submitValues(templateInstance)
  }
})

function submitValues (templateInstance) {
  // skip if there is no onInput connected
  // which can happen when creating new items
  if (!templateInstance.data.onInput) {
    return
  }

  const userId = templateInstance.data.userId
  const sessionId = templateInstance.data.sessionId
  const taskId = templateInstance.data.taskId
  const page = templateInstance.data.page
  const type = templateInstance.data.subtype

  const selection = templateInstance.state.get('selection')
  const responses = []
  Object.keys(selection).map(index => {
    const value = selection[index]
    if (value) {
      responses.push(index)
    }
  })

  if (responses.length === 0) {
    responses.push('__undefined__')
  }

  // we use a simple stringified cache as we have fixed
  // positions, so we can easily skip sending same repsonses
  const cache = templateInstance.responseCache.get()
  const strResponses = JSON.stringify(responses)
  if (strResponses === cache) {
    return
  }

  templateInstance.responseCache.set(strResponses)
  templateInstance.data.onInput({ userId, sessionId, taskId, page, type, responses })
}
