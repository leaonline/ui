import { Template } from 'meteor/templating'
import { ReactiveDict } from 'meteor/reactive-dict'
import Sortable from 'sortablejs'
import { createSubmitResponses } from '../utils/createSubmitResponses'
import '../explanation/itemExplanations'
import '../../../components/image/image'
import '../../../components/soundbutton/soundbutton'
import '../explanation/itemExplanations'
import './sortItemRenderer.css'
import './sortItemRenderer.html'

Template.sortItemRenderer.onCreated(function () {
  const instance = this
  instance.state = instance.state || new ReactiveDict()
  instance.state.setDefault({
    values: null,
    indexes: [],
    color: 'secondary',
    responseCache: null,
    readOnly: false
  })
  instance.submitResponse = createSubmitResponses({
    onInput: instance.data.onInput,
    responseCache: {
      get: () => instance.state.get('responseCache'),
      set: val => instance.state.set('responseCache', val)
    }
  })

  instance.autorun(() => {
    const data = Template.currentData()
    const { value, color, readOnly, scores } = data

    if (typeof value !== 'object') {
      return instance.state.set({ color: 'primary' })
    }

    const name = Math.floor(Math.random() * 10000)
    const values = value.list.map((entry, index) => {
      entry.name = name
      entry.index = index
      return entry
    })

    if (scores) {
      const indexes = instance.state.get('indexes') || []
      const entry = scores[0]
      const { correctResponse } = entry
      let isValid = correctResponse.length === indexes.length
      correctResponse.forEach((val, index) => {
        if (val == indexes[index]) {
          values[val].validationClass = 'bg-success text-light'
        } else {
          values[val].validationClass = 'bg-danger text-light'
          isValid = false
        }
      })
      const expected = isValid ? null : correctResponse.map((index) => values[index])
      const color = isValid ? 'success' : 'danger'
      const explanations = []
      if (value.explanation) {
        explanations.push(value.explanation)
      }
      if (entry.explanation) {
        explanations.push(entry.explanation)
      }
      instance.state.set({ color, expected, explanations })
    }

    instance.state.set({
      values, currentColor: color, readOnly
    })
  })
})
Template.sortItemRenderer.onRendered(function () {
  const instance = this
  instance.getResponse = () => {
    const responses = instance.state.get('indexes') ?? []

    // fallback for non-interaction
    if (responses.length === 0) {
      responses.push('__undefined__')
    }

    return responses
  }

  const color = instance.state.get('color')
  const el = instance.$('.sortable-root').get(0)
  instance.sortable = Sortable.create(el, {
    ghostClass: `bg-${color}`,
    dragClass: `bg-${color}`,
    chosenClass: `bg-${color}`,
    onSort: function (/**Event*/evt) {
      const indexes = []
      evt.to.childNodes.forEach(node => {
        if (node.dataset?.index) {
          indexes.push(node.dataset.index)
        }
      })
      instance.state.set('indexes', indexes)
      instance.$('.sortable-input').val(indexes.join(','))
    },
  })

  instance.autorun(() => {
    const data = Template.currentData()
    const { readOnly } = data
    if (readOnly) {
      instance.sortable.sort = false
    }

    // if we have any values cached we need to restore them here, because
    // the choices need to be drawn first, in order to access them
    if (typeof data.onLoad === 'function') {
      const cachedData = data.onLoad(data)

      if (cachedData) {
        // TODO we need to restore the order of the values here, because the sortable
      }
    }
  })
})

Template.sortItemRenderer.onDestroyed(function () {
  const instance = this
  instance.submitResponse({
    responses: instance.getResponse(),
    data: instance.data
  })
  instance.state.clear()
})

Template.sortItemRenderer.helpers({
  values () {
    const instance = Template.instance()
    return instance.state.get('values')
  },
  expected () {
    const instance = Template.instance()
    return instance.state.get('expected')
  },
  hovered (index) {
    const instance = Template.instance()
    return instance.state.get('hovered') === index
  },
  selected (index) {
    const instance = Template.instance()
    return instance.isSelected(index)
  },
  isExpected (index) {
    return Template.instance().state.get('scoring')?.[index]?.isExpected
  },
  color () {
    const instance = Template.instance()
    return instance.state.get('color')
  },
  explanations () {
    const instance = Template.instance()
    return instance.state.get('explanations')
  },
  getColor (index) {
    const instance = Template.instance()
    const scoring = instance.state.get('scoring')
    if (scoring) {
      const entry = scoring[index]
      return entry.color
    }

    if (instance.isSelected(index)) {
      return instance.state.get('color')
    }

    return 'light'
  },
  readOnly () {
    return Template.instance().state.get('readOnly')
  },
  scoring () {
    return Template.instance().state.get('scoring')
  },
})
Template.sortItemRenderer.events({})