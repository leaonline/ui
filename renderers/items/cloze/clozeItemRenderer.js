import { ReactiveVar } from 'meteor/reactive-var'
import { Template } from 'meteor/templating'
import { ReactiveDict } from 'meteor/reactive-dict'
import { Random } from 'meteor/random'
import { Cloze } from 'meteor/leaonline:corelib/items/text/Cloze'
import { createSimpleTokenizer } from 'meteor/leaonline:corelib/utils/tokenizer'
import { createSubmitResponses } from '../utils/createSubmitResponses'
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
const newLineRegExp = /\n/g
const tokenize = createSimpleTokenizer(startPattern, closePattern)

Template.clozeItemRenderer.onCreated(function () {
  const instance = this
  instance.state = new ReactiveDict()
  instance.tokens = new ReactiveVar()
  instance.error = new ReactiveVar()
  instance.color = new ReactiveVar('secondary')
  instance.responseCache = new ReactiveVar('')
  instance.submitResponse = createSubmitResponses({
    onInput: instance.data.onInput,
    responseCache: {
      get: () => instance.responseCache.get(),
      set: val => instance.responseCache.set(val)
    }
  })

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
      instance.error.set(null)
    } catch (e) {
      instance.error.set(e)
    }
  })
})

Template.clozeItemRenderer.onRendered(function () {
  const instance = this
  const { data } = instance

  if (typeof data.onLoad === 'function') {
    const cachedData = data.onLoad(data)
    if (cachedData?.responses) {
      instance.$('input').each(function (index, input) {
        const response = cachedData.responses[index]
        if (response && response !== '__undefined__') {
          instance.$(input).val(response)
        }
      })
    }
  }

  instance.getResponse = () => {
    const responses = []
    instance.$('input').each(function (index, input) {
      const value = instance.$(input).val()
      responses.push(value || '__undefined__')
    })
    return responses
  }
})

Template.clozeItemRenderer.onDestroyed(function () {
  const instance = this
  instance.submitResponse({
    responses: instance.getResponse(),
    data: instance.data
  })
  instance.state.clear()
})

Template.clozeItemRenderer.helpers({
  tokens () {
    return Template.instance().tokens.get()
  },
  isBlank (valueToken) {
    return valueToken.flavor === Cloze.flavor.blanks.value
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
  },
  inputWidth (length) {
    return length * 1.5
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
    templateInstance.submitResponse({
      responses: templateInstance.getResponse(),
      data: templateInstance.data
    })
  }
})

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
  const flavor = split[0]

  if (!Cloze.flavor[flavor]) {
    throw new Error(`Unexpected flavor - ${flavor}`)
  }

  entry.flavor = Cloze.flavor[flavor].value
  entry.value = getTokenValueForFlavor(entry.flavor, split[1])
  entry.tts = split[2]

  // optionally we can parse some configurations
  if (split[3]) {
    const configs = split[3].split('&')
    configs.forEach(configPair => {
      const configSplit = configPair.split('=')
      if (configSplit.length < 2) {
        return console.warn('Invalid config:', configPair)
      }
      entry[configSplit[0]] = configSplit[1]
    })
  }

  // a block entry has no value and is used, for example, to
  // render a d-block tts-button to read the whole text
  entry.isBlock = !entry.value || entry.value.length === 0

  return entry
}

const getTokenValueForFlavor = (flavor, rawValue = '') => {
  switch (flavor) {
    case Cloze.flavor.blanks.value:
      return tokenizeBlanks(flavor, rawValue)
    case Cloze.flavor.select.value:
      return tokenizeSelect(flavor, rawValue)
    default:
      throw new Error(`Unexpected flavor ${flavor}`)
  }
}

const tokenizeValue = createSimpleTokenizer('[', ']')
const tokenizeBlanks = (flavor, value) => {
  const split = tokenizeValue(value).map((token, index, arr) => {
    if (token.isToken) {
      token.hasPre = index > 0
      token.hasSuf = index < arr.length - 1
      token.flavor = flavor
    }
    return token
  })
  return split
}

const tokenizeSelect = (flavor, value) => {
  const split = tokenizeValue(value).map((token, index, arr) => {
    if (token.isToken) {
      token.value = token.value.split(optionsSeparator)
      token.hasPre = index > 0
      token.hasSuf = index < arr.length - 1
      token.flavor = flavor
    }
    return token
  })
  return split
}
