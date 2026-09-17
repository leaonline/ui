import { ReactiveVar } from 'meteor/reactive-var'
import { Template } from 'meteor/templating'
import { ReactiveDict } from 'meteor/reactive-dict'
import { Random } from 'meteor/random'
import { ClozeItemRendererUtils } from './utils/ClozeItemRendererUtils'
import { ClozeItemTokenizer } from './utils/ClozeItemTokenizer'
import { createSubmitResponses } from '../utils/createSubmitResponses'
import { getExplanations } from '../utils/getExplanations'
import '../explanation/itemExplanations'
import '../../../components/soundbutton/soundbutton'
import './clozeItemRenderer.css'
import '../common/itemRenderer.css'
import './clozeItemRenderer.html'

const CELL_SKIP = '<<>>' // TODO MOVE TO TOKENIZER

Template.clozeItemRenderer.onCreated(function () {
  const instance = this
  instance.state = new ReactiveDict()

  instance.tokens = new ReactiveVar()
  instance.error = new ReactiveVar()
  instance.isTable = new ReactiveVar()
  instance.hasTableBorder = new ReactiveVar()
  instance.color = new ReactiveVar('primary')
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
    const { value, color, scores, readOnly } = data

    if (color) {
      instance.color.set(color)
    }

    if (!value) return

    const { isTable, hasTableBorder = true } = value
    instance.isTable.set(isTable)
    instance.hasTableBorder.set(hasTableBorder)

    // since it can happen fast to enter some unexpected pattern for this component
    // we try the parsing and catch any exception and display it as an error below
    try {
      const tokens = ClozeItemTokenizer.tokenize({
          ...value,
          itemId: data.contentId
      })
      let index = 0
      const assignIndex = token => {
        if (Object.hasOwnProperty.call(token, 'flavor')) {
          token.itemIndex = index++
        }
      }

      if (isTable) {
        tokens.forEach(row => row.forEach(assignIndex))
      } else {
        tokens.forEach(assignIndex)
      }

      if (scores) {
        const explanations = getExplanations({ value, scores })
        // in scoring cloze items, we iterate over the tokens and assign the score to the token if it exists
        // XXX: we have introduced the itemId (=contentId) as additional search filter
        // to support scoring feedback when multiple items exist on a given page
        tokens.forEach(token => {
          if (ClozeItemRendererUtils.isItem(token.flavor)) {
            const score = scores.find(score => score.itemId === token.itemId && score.target == token.itemIndex)
            if (score) {
              token.wasScored = true
              token.isValid = score.score
              token.correctResponse = score.expected ? String(score.expected) : ''
              token.color = token.isValid ? 'success' : 'danger'
              token.isUndefined = score.isUndefined

              // to render the "expected" term/word, we need to
              // find the expected word from the token, because the correctResponse
              // only contains a RegEx pattern
              const expected = token.value?.length > 1
                  ? token.value[token.itemIndex]?.value
                  : token.value[0]?.value
              const showExpected = !token.isValid && expected

              // variant A: select
              if (showExpected && Array.isArray(expected)) {
                const index = score.correctResponse instanceof RegExp
                  ? Number(score.correctResponse.source)
                  : Number(score.correctResponse)
                if (Number.isInteger(index)) {
                  token.expected = expected[index]
                }
              }

              // variant B: blanks - use value directly
              if (showExpected && typeof expected === 'string') {
                token.expected = expected
              }
            }
          }
        })
        instance.state.set({ explanations })
      } else {
        instance.state.set({ explanations: null })
      }

      instance.tokens.set(tokens)
      instance.error.set(null)
      instance.state.set({ readOnly })
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
      instance.$('.cloze-item').each(function (index, input) {
        const response = cachedData.responses[index]
        if (response && response !== '__undefined__') {
          instance.$(input).val(response)
        }
      })
    }
  }

  instance.getResponse = () => {
    const responses = []
    instance.$('.cloze-item').each(function (index, input) {
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
  color () {
    return Template.instance().color.get()
  },
  error () {
    return Template.instance().error.get()
  },
  isTable () {
    return Template.instance().isTable.get()
  },
  hasTableBorder () {
    return Template.instance().hasTableBorder.get()
  },
  tableRows () {
    return Template.instance().tokens.get()
  },
  isCellSkip (value) {
    return value === CELL_SKIP
  },
  isEmpty (value) {
    return !value || value.length === 0
  },
  readOnly () {
    return Template.getState('readOnly')
  },
  explanations () {
    return Template.instance().state.get('explanations')
  }
})

Template.clozeItemRenderValueToken.helpers({
  loadComplete () {
    return Template.instance().state.get('loadComplete')
  },
  isBlank (token) {
    return ClozeItemRendererUtils.isBlank(token.flavor)
  },
  isSelect (token) {
    return ClozeItemRendererUtils.isSelect(token.flavor)
  },
  isEmpty (token) {
    return ClozeItemRendererUtils.isEmpty(token.flavor)
  },
  isText (token) {
    return ClozeItemRendererUtils.isText(token.flavor)
  },
  random () {
    return Random.id(10)
  },
  inputWidth (length) {
    return length * 1.5
  },
  maxLength (length) {
    return Math.floor(length * 1.5)
  },
  tableBorder () {

  },
  shouldShowCorrectResponse (token) {
    return token.wasScored && !token.isValid && token.expected
  }
})

Template.clozeItemRenderer.events({
  'input .cloze-input' (event, templateInstance) {
    const $target = templateInstance.$(event.currentTarget)
    const $container = templateInstance.$('.cloze-container')
    const isTable = templateInstance.isTable.get()

    // prevent layout overflow by limiting
    // overall width of an input to it's parent

    if (isTable || $target.width() >= $container.width()) {
      return
    }

    // otherwise we resize, if the word length
    // exceedes the default size of the input words
    const value = $target.val()
    const tokenIndex = $target.data('tokenindex')
    const valueIndex = $target.data('valueindex')
    const tokens = templateInstance.tokens.get()
    const originalSize = tokens[tokenIndex].value[valueIndex].length
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
