import { ReactiveVar } from 'meteor/reactive-var'
import { Template } from 'meteor/templating'
import { ReactiveDict } from 'meteor/reactive-dict'
import { Random } from 'meteor/random'
import { createSubmitResponses } from '../utils/createSubmitResponses'
import { ClozeItemRendererUtils } from './utils/ClozeItemRendererUtils'
import { ClozeItemTokenizer } from './utils/ClozeItemTokenizer'
import '../../../components/soundbutton/soundbutton'
import './clozeItemRenderer.html'
import './clozeItemRenderer.css'

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
      const tokens = ClozeItemTokenizer.tokenize(value)
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
      instance.$('input, select').each(function (index, input) {
        const response = cachedData.responses[index]
        if (response && response !== '__undefined__') {
          instance.$(input).val(response)
        }
      })
    }
  }

  instance.getResponse = () => {
    const responses = []
    instance.$('input, select').each(function (index, input) {
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
  isBlank (token) {
    return ClozeItemRendererUtils.isBlank(token.flavor)
  },
  isSelect (token) {
    return ClozeItemRendererUtils.isSelect(token.flavor)
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
  },
  inputSize (length) {
    return length > 2 ? length : 2
  },
  maxLength (length) {
    return length * 10
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
    const tokenIndex = $target.data('tokenindex')
    const tokens = templateInstance.tokens.get()
    const originalSize = tokens[tokenIndex].value.length
    const newSize = value.length > originalSize
      ? value.length
      : originalSize
    $target.attr('size', newSize)
  },
  'blur .cloze-input' (event, templateInstance) {
    templateInstance.submitResponse({
      responses: templateInstance.getResponse(),
      data: templateInstance.data
    })
  },
  'change .cloze-select' (event, templateInstance) {
    templateInstance.submitResponse({
      responses: templateInstance.getResponse(),
      data: templateInstance.data
    })
  }
})
