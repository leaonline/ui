import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { ReactiveDict } from 'meteor/reactive-dict'
import { Choice } from 'meteor/leaonline:corelib/items/choice/Choice'
import { shuffle } from 'meteor/leaonline:corelib/utils/shuffle'
import '../../../components/image/image'
import '../../../components/soundbutton/soundbutton'
import './choiceItemRenderer.css'
import './choiceItemRenderer.html'

Template.choiceItemRenderer.onCreated(function () {
  const instance = this
  instance.state = new ReactiveDict()
  instance.values = new ReactiveVar()
  instance.selected = new ReactiveVar(null)
  instance.hovered = new ReactiveVar(null)
  instance.isMultiple = new ReactiveVar(null)
  instance.color = new ReactiveVar('secondary')
  instance.responseCache = new ReactiveVar(null)

  instance.autorun(function () {
    const data = Template.currentData()
    const { value } = data
    const { color } = data

    if (color) {
      instance.color.set(color)
    }

    if (typeof value !== 'object') {
      return
    }

    const isMultiple = data.value.flavor === Choice.flavors.multiple.value
    instance.isMultiple.set(isMultiple)

    // then we process the choices to ensure that
    // event when shuffled, thier original index remains
    const name = Math.floor(Math.random() * 10000)
    const mapped = value.choices.map((entry, index) => {
      entry.name = name
      entry.index = index
      return entry
    })

    // assign the values plain or shuffled
    if (data.value.shuffle) {
      instance.values.set(shuffle(mapped))
    } else {
      instance.values.set(mapped)
    }
  })
})

Template.choiceItemRenderer.onDestroyed(function () {
  const instance = this
  submitValues(instance)
  instance.state.clear()
})

const parseResponse = responseStr => {
  if (responseStr === '__undefined__' ||
    typeof responseStr === 'undefined' ||
    responseStr === null) {
    return null
  }
  return Number.parseInt(responseStr, 10)
}

const nonNull = value => value !== null

Template.choiceItemRenderer.onRendered(function () {
  const instance = this
  // submitValues(instance)

  instance.autorun(() => {
    const data = Template.currentData()
    const isMultiple = instance.isMultiple.get()

    // if we have any values cached we need to restore them here, because
    // the choices need to be drawn first, in order to access them
    if (typeof data.onLoad === 'function') {
      const cachedData = data.onLoad(data)
      if (cachedData) {
        const { responses } = cachedData
        const selected = isMultiple
          ? responses.map(parseResponse).filter(nonNull)
          : parseResponse(responses[0])

        instance.selected.set(selected)
      }
    }
  })
})

Template.choiceItemRenderer.helpers({
  isMultiple () {
    return Template.instance().isMultiple.get()
  },
  choiceType () {
    return Template.instance().isMultiple.get()
      ? 'checkbox'
      : 'radio'
  },
  values () {
    const instance = Template.instance()
    return instance.values && instance.values.get()
  },
  hovered (index) {
    const instance = Template.instance()
    return instance.hovered && instance.hovered.get() === index
  },
  selected (index) {
    const instance = Template.instance()
    const selected = instance.selected && instance.selected.get()
    if (typeof selected === 'undefined' || selected === null) {
      return false
    }

    return instance.isMultiple.get()
      ? selected.includes(index)
      : selected === index
  },
  color () {
    const instance = Template.instance()
    return instance.color && instance.color.get()
  }
})

Template.choiceItemRenderer.events({
  'click .choice-soundbutton' (event) {
    event.stopPropagation()
  },
  'click .choice-interaction' (event, templateInstance) {
    const $target = templateInstance.$(event.currentTarget)
    const indexStr = $target.data('index')
    const name = $target.data('name')
    const index = parseInt(indexStr, 10)
    const isMultiple = templateInstance.isMultiple.get()
    let selection = templateInstance.selected.get()

    if (isMultiple) {
      // on multiple elements we need to make sure
      // the selected variable holds an array
      // and simulate a toggling of arbitrary
      // selection indices that come from the options
      if (!Array.isArray(selection)) selection = []
      const selectedPos = selection.indexOf(index)
      const isSelected = selectedPos > -1

      // if selected, remove, else add to selection
      if (isSelected) {
        selection.splice(selectedPos, 1)
      } else {
        selection.push(index)
      }

      templateInstance.selected.set(selection)
      templateInstance.$(`#${name}-${index}`).prop('checked', !isSelected)
    } else {
      // on single elements we need to make sure
      // the selected variable is a number
      // and only replace it with the current index

      // skip if we have already selected this
      if (selection === index) return

      templateInstance.selected.set(index)
      templateInstance.$(`#${name}-${index}`).prop('checked', true)
    }

    submitValues(templateInstance)
  },
  'mouseenter .choice-entry' (event, templateInstance) {
    const index = templateInstance.$(event.currentTarget).data('index')
    const hovered = Number.parseInt(index, 10)
    templateInstance.hovered.set(hovered)
  },
  'mouseleave .choice-entry' (event, templateInstance) {
    templateInstance.hovered.set(null)
  }
})

function submitValues (templateInstance) {
  const warn = (...args) => Meteor.isDevelopment &&
    console.warn(templateInstance.name, ...args)
  const responses = templateInstance.isMultiple.get()
    ? multipleResponse(templateInstance)
    : singleResponse(templateInstance)

  // fallback for non-interaction
  if (responses.length === 0) {
    responses.push('__undefined__')
  }

  // skip if there is no onInput connected
  // which can happen when creating new items
  if (!templateInstance.data.onInput) {
    return warn('missing input handler')
  }

  const userId = templateInstance.data.userId
  const sessionId = templateInstance.data.sessionId
  const unitId = templateInstance.data.unitId
  const page = templateInstance.data.page
  const type = templateInstance.data.subtype
  const contentId = templateInstance.data.contentId

  // also return if our identifier values
  // are not set, which also can occur in item-dev
  if (!userId || !sessionId || !unitId || !contentId) {
    return warn('missing args', templateInstance.data)
  }

  // we use a simple stringified cache as we have fixed
  // positions, so we can easily skip sending same repsonses
  const cache = templateInstance.responseCache.get()
  const strResponses = JSON.stringify(responses)
  if (strResponses === cache) {
    return
  }

  templateInstance.responseCache.set(strResponses)
  templateInstance.data.onInput({
    userId,
    sessionId,
    unitId,
    page,
    contentId,
    type,
    responses
  })
}

function singleResponse (templateInstance) {
  const responses = []

  templateInstance.$('input:radio').each(function (index, radioButton) {
    const $rb = templateInstance.$(radioButton)
    if ($rb.is(':checked')) {
      responses[0] = $rb.val()
    }
  })

  return responses
}

function multipleResponse (templateInstance) {
  const responses = []

  templateInstance.$('input:checkbox').each(function (index, checkbox) {
    const $cb = templateInstance.$(checkbox)
    if ($cb.is(':checked')) {
      responses.push($cb.val())
    }
  })

  return responses
}
