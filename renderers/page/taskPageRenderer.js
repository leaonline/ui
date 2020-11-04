/* global EventTarget Event */
import { Template } from 'meteor/templating'
import { Meteor } from 'meteor/meteor'
import '../factory/TaskRendererFactory'
import './taskPageRenderer.html'
import '../../components/actionButton/actionButton'

Template.taskPageRenderer.onCreated(function () {
  const instance = this
  instance.collector = new EventTarget()

  console.log(instance.data)

  const parseData = data => {
    const unitDoc = data.doc
    const color = data.color || 'secondary'
    const currentPageCount = data.currentPageCount || 0
    const sessionId = data.sessionId

    instance.state.set('isPreview', data.isPreview)
    instance.state.set('sessionDoc', sessionId)
    instance.state.set('unitDoc', unitDoc)

    if (unitDoc.pages) {
      instance.state.set('maxPages', unitDoc.pages.length)
      instance.state.set('currentPageCount', currentPageCount)
      instance.state.set('currentPage', unitDoc.pages[currentPageCount])
      instance.state.set('hasNext', unitDoc.pages.length > currentPageCount + 1)
    }
    instance.state.set('color', color)
  }

  instance.autorun(() => {
    const data = Template.currentData()
    parseData(data)
  })

  parseData(instance.data)
})

Template.taskPageRenderer.helpers({
  loadComplete () {
    const instance = Template.instance()
    return instance.state.get('unitDoc')
  },
  unitDoc () {
    return Template.getState('unitDoc')
  },
  currentType () {
    return Template.getState('color')
  },
  dimension () {
    return Template.getState('dimension')
  },
  currentPage () {
    return Template.getState('currentPage')
  },
  currentPageCount () {
    return Template.getState('currentPageCount') + 1
  },
  maxPages () {
    return Template.getState('maxPages')
  },
  hasNext () {
    return Template.getState('hasNext')
  },
  hasPrev () {
    return Template.getState('hasPrev')
  },
  itemData (content) {
    const instance = Template.instance()
    const sessionId = instance.state.get('sessionId')
    const unitDoc = instance.state.get('unitDoc')
    const page = instance.state.get('currentPageCount')
    const unitId = unitDoc._id
    const userId = Meteor.userId()
    const color = instance.state.get('color')
    const collector = instance.collector
    return Object.assign({}, content, {
      userId,
      sessionId,
      unitId,
      page,
      color,
      // onInput: onInput.bind(this),
      collector: collector
    })
  },
  showFinishButton () {
    const instance = Template.instance()
    return !instance.state.get('isPreview') && !instance.state.get('hasNext')
  }
})

Template.taskPageRenderer.events({
  'click .lea-pagenav-button' (event, templateInstance) {
    event.preventDefault()
    const action = templateInstance.$(event.currentTarget).data('action')
    const unitDoc = templateInstance.state.get('unitDoc')
    const currentPageCount = templateInstance.state.get('currentPageCount')
    const newPage = {}

    if (action === 'next') {
      newPage.currentPageCount = currentPageCount + 1
      newPage.currentPage = unitDoc.pages[newPage.currentPageCount]
      newPage.hasNext = (newPage.currentPageCount + 1) < unitDoc.pages.length
    }

    if (action === 'back') {
      newPage.currentPageCount = currentPageCount - 1
      newPage.currentPage = unitDoc.pages[newPage.currentPageCount]
      newPage.hasNext = (newPage.currentPageCount + 1) < unitDoc.pages.length
    }

    if (!newPage.currentPage) {
      throw new Error(`Undefined page for current index ${newPage.currentPageCount}`)
    }

    templateInstance.collector.dispatchEvent(new Event('collect'))

    const $current = templateInstance.$('.lea-unit-current-content-container')
    const currentHeight = $current.height()
    const oldContainerCss = $current.css('height') || ''
    $current.css('height', `${currentHeight}px`)

    templateInstance.state.set(newPage)

    setTimeout(() => {
      $current.css('height', oldContainerCss)
    }, 100)
  },
  'click .lea-pagenav-finish-button' (event, templateInstance) {
    event.preventDefault()
    if (templateInstance.onFinish) {
      templateInstance.onFinish()
    }
  }
})
