import { ReactiveDict } from 'meteor/reactive-dict'
import { ReactiveVar } from 'meteor/reactive-var'
import { Template } from 'meteor/templating'
import { shuffle } from 'meteor/leaonline:corelib/utils/shuffle' // TODO inject shuffle from host project
import './choiceItemRendererSingle.html'

Template.choiceItemRendererSingle.onCreated(function () {
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

Template.choiceItemRendererSingle.onDestroyed(function () {
  const instance = this
  submitValues(instance)
  instance.state.clear()
})

Template.choiceItemRendererSingle.onRendered(function () {
  const instance = this
  submitValues(instance)
})

Template.choiceItemRendererSingle.helpers({
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
    return instance.selected && instance.selected.get() === index
  },
  color () {
    const instance = Template.instance()
    return instance.color && instance.color.get()
  }
})

Template.choiceItemRendererSingle.events({
  'click .choice-soundbutton' (event) {
    event.stopPropagation()
  },
  'click .choice-entry' (event, templateInstance) {
    const $target = templateInstance.$(event.currentTarget)
    const indexStr = $target.data('index')
    const name = $target.data('name')
    const index = parseInt(indexStr, 10)
    const selection = templateInstance.selected.get()

    // skip if we have already selected this
    if (selection === index) return

    templateInstance.selected.set(index)
    templateInstance.$(`#${name}-${index}`).prop('checked', true)

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
  let value = ''

  templateInstance.$('input:radio').each(function (index, radioButton) {
    const $rb = templateInstance.$(radioButton)
    if ($rb.is(':checked')) {
      value = $rb.val()
    }
  })

  // skip if there is no onInput connected
  // which can happen when creating new items
  if (!templateInstance.data.onInput) {
    return
  }

  const userId = templateInstance.data.userId
  const sessionId = templateInstance.data.sessionId
  const unitId = templateInstance.data.unitId
  const page = templateInstance.data.page
  const type = templateInstance.data.subtype

  // also return if our identifier values
  // are not set, which also can occur in item-dev
  if (!userId || !sessionId || !unitId) {
    return
  }

  const responses = []
  if (value.length > 0) {
    responses.push(value)
  } else {
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
  templateInstance.data.onInput({
    userId,
    sessionId,
    unitId,
    page,
    type,
    responses
  })
}
