import { ReactiveVar } from 'meteor/reactive-var'
import { Template } from 'meteor/templating'
import { ReactiveDict } from 'meteor/reactive-dict'
import { Random } from 'meteor/random'
import { Cloze } from 'meteor/leaonline:corelib/items/text/Cloze'
import { createSimpleTokenizer } from 'meteor/leaonline:corelib/utils/tokenizer'
import '../../../components/soundbutton/soundbutton'
import './clozeItemRenderer.html'
import './clozeItemRenderer.css'

// TODO we should extract these into the Cloze definition or as a helper
// TODO because we can then share these with the editor form component
// TODO and validate the input before being saved and avoid runtime errors
const separator = '$'
const startPattern = '{{'
const closePattern = '}}'
const newLinePattern = '//'
const optionsSeparator = '|'
const newLineReplacer = `${startPattern}${newLinePattern}${closePattern}`
const newLineRegExp = new RegExp(/\n/, 'g')
const tokenize = createSimpleTokenizer(startPattern, closePattern)

Template.clozeItemRenderer.onCreated(function () {
  const instance = this
  instance.state = new ReactiveDict()
  instance.tokens = new ReactiveVar()
  instance.flavor = new ReactiveVar()
  instance.error = new ReactiveVar()
  instance.color = new ReactiveVar('secondary')
  instance.responseCache = new ReactiveVar('')

  instance.autorun(() => {
    const data = Template.currentData()

    // set the color of the current dimension
    // only if it has been passed with the data
    const { color } = data
    if (color) {
      instance.color.set(color)
    }

    const { value } = data
    if (!value) return

    // since it can happen fast to enter some unexpected pattern for this component
    // we try the parsing and catch any exception and display it as an error below
    try {
      const { text, flavor } = value
      const preprocessedValue = text.replace(newLineRegExp, newLineReplacer)
      const tokens = tokenize(preprocessedValue).map(toTokens, { flavor })
      instance.tokens.set(tokens)
      instance.flavor.set(flavor)
      instance.error.set(null)
    } catch (e) {
      instance.error.set(e)
    }
  })
})

Template.clozeItemRenderer.onDestroyed(function () {
  const instance = this
  submitValues(instance)
  instance.state.clear()
})

Template.clozeItemRenderer.helpers({
  tokens () {
    return Template.instance().tokens.get()
  },
  isBlank (token) {
    return token.flavor === Cloze.flavor.blanks.value
  },
  isSelect (token) {
    return token.flavor === Cloze.flavor.select.value
  },
  color () {
    return Template.instance().color.get()
  },
  random () {
    return Random.id(10)
  },
  error () {
    return Template.instance().error.get()
  }
})

Template.clozeItemRenderer.events({
  'input .cloze-input' (event, templateInstance) {
    const $target = templateInstance.$(event.currentTarget)
    const $container = templateInstance.$('.cloze-container')

    // prevent layout overflow by limiting
    // overall width of an input to it's parent

    if ($target.width() >= $container.width()) {
      return
    }
    // otherwise we resize, if the word length
    // exceedes the default size of the input words
    const value = $target.val()
    const tokenindex = $target.data('tokenindex')
    const tokens = templateInstance.tokens.get()
    const originalSize = tokens[tokenindex].value.length
    const newSize = value.length > originalSize ? value.length : originalSize
    $target.attr('size', newSize)
  },
  'blur .cloze-input' (event, templateInstance) {
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

  // also return if our identifier values
  // are not set, which also can occur in item-dev
  if (!userId || !sessionId || !taskId) {
    return
  }

  const responses = []
  templateInstance.$('input').each(function (index, input) {
    const value = templateInstance.$(input).val()
    responses.push(value || '__undefined__')
  })

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

function toTokens (entry) {
  // we simply indicate newlines within
  // our brackets to avoid complex parsing
  if (entry.value.indexOf('//') > -1) {
    entry.isNewLine = true
    return entry
  }

  // for normal text tokens we don't need
  // further processing of content here
  if (entry.value.indexOf(separator) === -1) {
    return entry
  }

  // if this is an interactive token
  // we process ist from the value split
  const split = entry.value.split('$')
  const flavor = Number.parseInt(split[0], 10)
  console.log(flavor)
  if (Number.isNaN(flavor)) {
    throw new Error(`Unexpected flavor parsed as NaN - ${split[0]}`)
  }

  entry.flavor = flavor
  entry.value = getTokenValueForFlavor(flavor, split[1])
  entry.label = split[2]
  entry.tts = split[3]
  entry.length = entry.value.length
  entry.isBlock = !entry.value && !entry.label
  return entry
}

const getTokenValueForFlavor = (flavor, rawValue = '') => {
  switch (flavor) {
    case Cloze.flavor.blanks.value:
      return rawValue
    case Cloze.flavor.select.value:
      return rawValue.split(optionsSeparator)
    default:
      throw new Error(`Unexpected flavor ${flavor}`)
  }
}