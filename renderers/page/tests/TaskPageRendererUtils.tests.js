import { expect } from 'chai'
import { TaskPageRendererUtils as utils } from '../TaskPageRendererUtils'

describe('TaskPageRendererUtils', () => {
  describe('createNewPage', () => {
    const pages = [{ content: [] }, { content: [] }, { content: [] }]

    it('moves forward and back and reports whether another page exists', () => {
      expect(
        utils.createNewPage({ action: 'next', currentPageCount: 0, pages }),
      ).to.deep.equal({
        currentPageCount: 1,
        currentPage: pages[1],
        hasNext: true,
      })
      expect(
        utils.createNewPage({ action: 'next', currentPageCount: 1, pages }),
      ).to.deep.equal({
        currentPageCount: 2,
        currentPage: pages[2],
        hasNext: false,
      })
      const back = utils.createNewPage({
        action: 'back',
        currentPageCount: 1,
        pages,
      })
      expect(back).to.deep.equal({
        currentPageCount: 0,
        currentPage: pages[0],
        hasNext: true,
      })
      expect(back.currentPage).to.equal(pages[0])
    })

    it('rejects navigation outside the page range or an unsupported action', () => {
      for (const [action, currentPageCount, target] of [
        ['back', 0, -1],
        ['next', 2, 3],
        ['unknown', 0, undefined],
      ]) {
        expect(() =>
          utils.createNewPage({ action, currentPageCount, pages }),
        ).to.throw(`Undefined page for current index ${target}`)
      }
      expect(() =>
        utils.createNewPage({ action: 'next', currentPageCount: 0, pages: [] }),
      ).to.throw('Undefined page for current index 1')
    })
  })

  it('defaults missing page indexes and resets indexes beyond the last page', () => {
    const pages = [{}, {}]
    for (const [currentPageCount, expected] of [
      [undefined, 0],
      [null, 0],
      [0, 0],
      [1, 1],
      [2, 0],
      [20, 0],
    ]) {
      expect(utils.getCurrentPageCount({ currentPageCount, pages })).to.equal(
        expected,
      )
    }
    expect(
      utils.getCurrentPageCount({ currentPageCount: 0, pages: [] }),
    ).to.equal(0)
    expect(utils.getCurrentPageCount({})).to.equal(0)
  })

  it('enables scoring and correct responses only for evaluated learning pages', () => {
    for (const isLearning of [false, true]) {
      for (const isStory of [false, true]) {
        for (const onEvaluate of [undefined, () => []]) {
          const data = { isLearning, isStory, onEvaluate }
          const expected = isLearning && !isStory && !!onEvaluate
          expect(utils.showScoring(data)).to.equal(expected)
          expect(utils.showCorrectResponse(data)).to.equal(expected)
        }
      }
    }
  })

  it('initializes the state for a document with no pages', () => {
    const doc = { _id: 'unit', pages: [] }
    expect(
      utils.parseData({
        doc,
        isLearning: true,
        isStory: false,
        isPreview: true,
        sessionId: 'session',
        onEvaluate: () => [],
      }),
    ).to.deep.equal({
      isPreview: true,
      isStory: false,
      sessionId: 'session',
      showScoring: true,
      showCorrectResponse: true,
      scoring: null,
      feedback: null,
      wasScored: false,
      unitDoc: doc,
      hasItems: undefined,
      currentPage: undefined,
      currentPageCount: 0,
      maxPages: 0,
      hasNext: false,
    })
  })

  it('gates navigation and feedback for each combination of page and scoring state', () => {
    for (const hasNext of [false, true]) {
      for (const hasItems of [false, true]) {
        for (const showScoring of [false, true]) {
          for (const showCorrectResponse of [false, true]) {
            for (const wasScored of [false, true]) {
              const data = {
                hasNext,
                hasItems,
                showScoring,
                showCorrectResponse,
                wasScored,
              }
              const needsFeedback =
                hasItems && (showScoring || showCorrectResponse) && !wasScored
              expect(utils.showFeedback(data), JSON.stringify(data)).to.equal(
                needsFeedback,
              )
              expect(utils.showNext(data), JSON.stringify(data)).to.equal(
                hasNext && !needsFeedback,
              )
            }
          }
        }
      }
    }
  })
})
