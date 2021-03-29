import { Template } from 'meteor/templating'
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
  instance.state.setDefault('values', null)
  instance.state.setDefault('selected', null)
  instance.state.setDefault('hovered', null)
  instance.state.setDefault('color', 'secondary')
  instance.state.setDefault('isMultiple', null)
  instance.state.setDefault('responseCache', null)

  instance.autorun(function () {
    const data = Template.currentData()
    const { value } = data
    const { color } = data

    if (color) {
      instance.state.set('color', color)
    }

    if (typeof value !== 'object') {
      return
    }

    // clear instance and rebuild for now data to make sure not leftovers are
    // still in the state
    instance.state.clear()

    const isMultiple = data.value.flavor === Choice.flavors.multiple.value
    instance.state.set('isMultiple', isMultiple)

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
      instance.state.set('values', shuffle(mapped))
    }

    else {
      instance.state.set('values', mapped)
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
    const isMultiple = instance.state.get('isMultiple')

    // if we have any values cached we need to restore them here, because
    // the choices need to be drawn first, in order to access them
    if (typeof data.onLoad === 'function') {
      const cachedData = data.onLoad(data)
      if (cachedData) {
        const { responses } = cachedData
        const selected = isMultiple
          ? responses.map(parseResponse).filter(nonNull)
          : parseResponse(responses[0])

        instance.state.set('selected', selected)
      }
    }
  })
})

Template.choiceItemRenderer.helpers({
  isMultiple () {
    return Template.instance().state.get('isMultiple')
  },
  choiceType () {
    return Template.instance().state.get('isMultiple')
      ? 'checkbox'
      : 'radio'
  },
  values () {
    const instance = Template.instance()
    return instance.state.get('values')
  },
  hovered (index) {
    const instance = Template.instance()
    return instance.state.get('hovered') === index
  },
  selected (index) {
    const instance = Template.instance()
    const selected = instance.selected && instance.state.get('selected')
    if (typeof selected === 'undefined' || selected === null) {
      return false
    }

    return instance.state.get('isMultiple')
      ? selected?.includes?.(index)
      : selected === index
  },
  color () {
    const instance = Template.instance()
    return instance.color && instance.state.get('color')
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
    const isMultiple = templateInstance.state.get('isMultiple')
    let selection = templateInstance.state.get('selected')

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

      templateInstance.state.set('selected', selection)
      templateInstance.$(`#${name}-${index}`).prop('checked', !isSelected)
    } else {
      // on single elements we need to make sure
      // the selected variable is a number
      // and only replace it with the current index

      // skip if we have already selected this
      if (selection === index) return

      templateInstance.state.set('selected', index)
      templateInstance.$(`#${name}-${index}`).prop('checked', true)
    }

    submitValues(templateInstance)
  },
  'mouseenter .choice-entry' (event, templateInstance) {
    const index = templateInstance.$(event.currentTarget).data('index')
    const hovered = Number.parseInt(index, 10)
    templateInstance.state.set('hovered', hovered)
  },
  'mouseleave .choice-entry' (event, templateInstance) {
    templateInstance.state.set('hovered', null)
  }
})

function submitValues (templateInstance) {
  const warn = (...args) => console.warn(templateInstance.name, ...args)

  // skip if there is no onInput connected
  // which can happen when creating new items
  if (!templateInstance.data.onInput) {
    return console.warn('[choiceItemRenderer]: onInput handler is missing. Skip submitting values.')
  }

  const responses = templateInstance.state.get('isMultiple')
    ? multipleResponse(templateInstance)
    : singleResponse(templateInstance)

  // fallback for non-interaction
  if (responses.length === 0) {
    responses.push('__undefined__')
  }

  // we use a simple stringified cache as we have fixed
  // positions, so we can easily skip sending same responses
  const cache = templateInstance.state.get('responseCache')
  const strResponses = JSON.stringify(responses)
  if (strResponses === cache) {
    return
  }

  const userId = templateInstance.data.userId
  const sessionId = templateInstance.data.sessionId
  const unitId = templateInstance.data.unitId
  const page = templateInstance.data.page
  const type = templateInstance.data.subtype
  const contentId = templateInstance.data.contentId

  templateInstance.state.set('responseCache', strResponses)
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
