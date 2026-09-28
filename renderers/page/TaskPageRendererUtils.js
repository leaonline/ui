export const TaskPageRendererUtils = {}

/**
 *
 * @param action {string} next or back
 * @param currentPageCount {number}
 * @param pages {object[]} pages object from current unitDoc
 * @return {object}
 */
TaskPageRendererUtils.createNewPage = ({ action, currentPageCount, pages }) => {
  const newPage = {}

  if (action === 'next') {
    newPage.currentPageCount = currentPageCount + 1
    newPage.currentPage = pages[newPage.currentPageCount]
    newPage.hasNext = newPage.currentPageCount + 1 < pages.length
  }

  if (action === 'back') {
    newPage.currentPageCount = currentPageCount - 1
    newPage.currentPage = pages[newPage.currentPageCount]
    newPage.hasNext = newPage.currentPageCount + 1 < pages.length
  }

  if (!newPage.currentPage) {
    throw new Error(
      `Undefined page for current index ${newPage.currentPageCount}`,
    )
  }

  return newPage
}

TaskPageRendererUtils.parseData = ({
  doc,
  isLearning,
  isStory,
  onEvaluate,
  isPreview,
  sessionId,
  currentPageCount,
  color,
}) => {
  const unitDoc = doc
  color = color || 'secondary'
  currentPageCount = currentPageCount || 0
  if (currentPageCount >= unitDoc.pages?.length) {
    currentPageCount = 0
  }
  const showScoring = isLearning && !isStory && !!onEvaluate
  const showCorrectResponse = isLearning && !isStory && !!onEvaluate
  let currentPage
  let hasItems

  if (unitDoc.pages?.length) {
    currentPage = unitDoc.pages[currentPageCount]
    const userId = Meteor.userId()
    hasItems = currentPage?.content?.some((entry) => entry.type === 'item')

    currentPage.content = currentPage.content.map((entry) => {
      //entry.unitDoc = unitDoc
      entry.unitId = unitDoc._id
      entry.page = currentPageCount
      entry.sessionId = data.sessionId
      entry.userId = userId
      entry.color = color
      return entry
    })
  }

  return {
    isPreview,
    isStory,
    sessionId,
    showScoring,
    showCorrectResponse,
    scoring: null,
    feedback: null,
    wasScored: false,
    unitDoc,
    hasItems,
    currentPage,
    currentPageCount,
    maxPages: unitDoc.pages.length,
    hasNext: unitDoc.pages.length > currentPageCount + 1,
  }
}

TaskPageRendererUtils.showScoring = ({ isLearning, isStory, onEvaluate }) => {
  return isLearning && !isStory && !!onEvaluate
}

TaskPageRendererUtils.showCorrectResponse = ({
  isLearning,
  isStory,
  onEvaluate,
}) => {
  return isLearning && !isStory && !!onEvaluate
}

TaskPageRendererUtils.getCurrentPageCount = ({ currentPageCount, pages }) => {
  currentPageCount = currentPageCount ?? 0
  if (currentPageCount >= pages?.length) {
    currentPageCount = 0
  }
  return currentPageCount
}

TaskPageRendererUtils.showNext = ({
  hasNext,
  hasItems,
  showScoring,
  showCorrectResponse,
  wasScored,
}) => {
  if (!hasNext) return false
  if (!hasItems) return true
  return wasScored || (!showScoring && !showCorrectResponse)
}

TaskPageRendererUtils.showFeedback = ({
  hasItems,
  showScoring,
  showCorrectResponse,
  wasScored,
}) => {
  if (!hasItems) return false
  return (showScoring || showCorrectResponse) && !wasScored
}
