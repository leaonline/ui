import { Template } from 'meteor/templating'
import { Meteor } from 'meteor/meteor'
import '../factory/TaskRendererFactory'
import '../../components/actionButton/actionButton'
import './taskPageRenderer.html'

Template.taskPageRenderer.onCreated(function () {
  const instance = this

  const parseData = data => {
    const unitDoc = data.doc
    const color = data.color || 'secondary'
    const currentPageCount = data.currentPageCount || 0

    instance.state.set('isPreview', data.isPreview)
    instance.state.set('sessionId', data.sessionId)
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
  hasPages () {
    const unitDoc = Template.getState('unitDoc')
    return unitDoc?.pages?.length > 0
  },
  currentStimuli (unitDoc) {
    if (!unitDoc) return

    return unitDoc.story || unitDoc.stimuli
  },
  currentInstructions (unitDoc) {
    const instance = Template.instance()
    const currentPage = instance.state.get('currentPage')
    if (currentPage && currentPage?.instructions) {
      return currentPage.instructions
    }

    return unitDoc.instructions
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
  waitForSubmit () {
    return Template.getState('waitForSubmit')
  },
  hasPrev () {
    return Template.getState('hasPrev')
  },
  itemData (content) {
    const instance = Template.instance()
    const sessionId = instance.state.get('sessionId')
    const unitDoc = instance.state.get('unitDoc')
    const isPreview = instance.state.get('isPreview')
    const page = instance.state.get('currentPageCount')
    const unitId = unitDoc._id
    const userId = Meteor.userId()
    const color = instance.state.get('color')
    const { onInput } = instance.data
    const { onLoad } = instance.data

    return Object.assign({}, content, {
      userId,
      sessionId,
      unitId,
      page,
      color,
      onInput: !isPreview ? onInput : undefined,
      onLoad: !isPreview ? onLoad : undefined
    })
  },
  showFinishButton () {
    const instance = Template.instance()
    return !instance.state.get('isPreview') && !instance.state.get('hasNext')
  },
  updating () {
    return Template.getState('updating')
  },
  finishing () {
    return Template.getState('finishing')
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

    const $current = templateInstance.$('.lea-unit-current-content-container')
    const currentHeight = $current.height()
    const oldContainerCss = $current.css('height') || ''
    $current.css('height', `${currentHeight}px`)

    if (typeof templateInstance.data.onNewPage === 'function') {
      templateInstance.state.set('waitForSubmit', true)
      templateInstance.data.onNewPage({ action, newPage }, () => {
        templateInstance.state.set(newPage)
        templateInstance.state.set('waitForSubmit', false)
      })
    } else {
      templateInstance.state.set(newPage)

      setTimeout(() => {
        $current.css('height', oldContainerCss)
      }, 100)
    }
  },
  'click .lea-pagenav-finish-button' (event, templateInstance) {
    event.preventDefault()

    if (!templateInstance.state.get('finishing') && templateInstance.onFinish) {
      templateInstance.state.set('finishing', true)
      templateInstance.onFinish()
    }
  }
})
