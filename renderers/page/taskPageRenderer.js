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
    const showScoring = data.isLearning && !data.isStory && !!data.onEvaluate
    const showCorrectResponse = data.isLearning && !data.isStory  && !!data.onEvaluate

    instance.state.set({
      isPreview: data.isPreview,
      isStory: data.isStory,
      sessionId: data.sessionId,
      showScoring,
      showCorrectResponse,
      scoring: null,
      feedback: null,
      wasScored: false,
      unitDoc
    })

    if (unitDoc.pages) {
      const currentPage = unitDoc.pages[currentPageCount]
      const userId = Meteor.userId()
      currentPage.content = currentPage.content.map(entry => {
        //entry.unitDoc = unitDoc
        entry.uniId = unitDoc._id
        entry.page = currentPageCount
        entry.sessionId = data.sessionId
        entry.userId = userId
        entry.color = color
        return entry
      })

      instance.state.set({
        currentPage,
        currentPageCount,
        maxPages: unitDoc.pages.length,
        hasNext: unitDoc.pages.length > currentPageCount + 1,
      })

    }

    instance.state.set('color', color)

    instance.showNext = () => {
      const hasNext = instance.state.get('hasNext')
      if (!hasNext) return false

      const showScoring = instance.state.get('showScoring')
      const showCorrectResponse = instance.state.get('showCorrectResponse')
      const wasScored = instance.state.get('wasScored')

      return wasScored || (!showScoring && !showCorrectResponse)
    }

    instance.showFeedback = () => {
      const showScoring = instance.state.get('showScoring')
      const showCorrectResponse = instance.state.get('showCorrectResponse')
      const wasScored = instance.state.get('wasScored')
      return (showScoring || showCorrectResponse) && !wasScored
    }
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
  showNext () {
    return Template.instance().showNext()
  },
  showScoring () {
    return Template.getState('showScoring')
  },
  showCorrectResponse () {
    return Template.getState('showCorrectResponse')
  },
  showFeedback () {
    return Template.instance().showFeedback()
  },
  waitForSubmit () {
    return Template.getState('waitForSubmit')
  },
  hasPrev () {
    return Template.getState('isPreview') && Template.getState('currentPageCount') > 0
  },
  itemData (content) {
    const instance = Template.instance()
    const { onInput, onLoad, onEvaluate } = instance.data
    return Object.assign({}, content, {
      onInput,
      onLoad,
      onEvaluate,
      scores: instance.state.get('scoring'),
      readOnly: instance.state.get('wasScored')
    })
  },
  showFinishButton () {
    const instance = Template.instance()
    return !instance.state.get('hasNext') && !instance.state.get('isStory')
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
  },
  'click .lea-evaluate-btn': async function (event, templateInstance) {
    event.preventDefault()
    if (templateInstance.data.onEvaluate) {
      const scoring = await templateInstance.data.onEvaluate()
      templateInstance.state.set({ scoring })
    }

    templateInstance.state.set({ wasScored: true })
  }
})
