import { expect } from 'chai'
import { Blaze } from 'meteor/blaze'
import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import {
  createRendererTestContext,
  waitFor,
} from '../../../tests/rendererHelpers.tests'
import { TaskRenderers } from '../../Renderers'
import '../../embed/embeddedResourceRenderer'
import '../taskPageRenderer'

describe('taskPageRenderer', () => {
  const { render, setup, teardown, sandbox, afterFlush } =
    createRendererTestContext()
  let subtype
  let registry
  const content = (value, type = 'text') => ({
    subtype,
    type,
    value: `<p>${value}</p>`,
    width: '12',
    contentId: value,
  })
  const doc = () => ({
    _id: 'unit-a',
    pages: [{ content: [content('First')] }, { content: [content('Second')] }],
  })
  const pageText = (root) =>
    root.querySelector('.lea-unit-current-content')?.textContent.trim()
  beforeEach(() => {
    setup()
    if (Meteor.userId) sandbox.stub(Meteor, 'userId').returns('user-a')
    else sandbox.define(Meteor, 'userId', () => 'user-a')
    subtype = `page-test-${Random.id()}`
    registry = TaskRenderers.registerRenderer({
      name: subtype,
      template: 'embeddedResourceRenderer',
      load: async () => {},
    })
  })
  afterEach(() => {
    teardown()
    registry?.delete(subtype)
  })

  it('renders the first page and forwards independent content IDs, session and callbacks', async () => {
    const unit = doc()
    unit.pages[0].content.push(content('Other', 'item'))
    const onInput = sandbox.spy()
    const onLoad = sandbox.spy()
    const root = await render('taskPageRenderer', {
      doc: unit,
      sessionId: 'session-a',
      color: 'info',
      onInput,
      onLoad,
    })
    await waitFor(
      () =>
        root.querySelectorAll('.lea-unit-current-content .embed-responsive')
          .length === 2,
      'both page contents',
    )
    const rendered = [
      ...root.querySelectorAll('.lea-unit-current-content .embed-responsive'),
    ].map((element) => Blaze.getData(element))
    expect(rendered.map(({ contentId }) => contentId)).to.deep.equal([
      'First',
      'Other',
    ])
    for (const entry of rendered) {
      expect(entry).to.include({
        unitId: 'unit-a',
        page: 0,
        sessionId: 'session-a',
        userId: 'user-a',
        color: 'info',
        type: 'info',
        onInput,
        onLoad,
        scores: null,
        readOnly: false,
      })
    }
    expect(
      root.querySelector('.trapezoid').textContent.replace(/\s+/g, ' ').trim(),
    ).to.equal('1 / 2')
    expect(root.querySelector('[data-action="next"]')).not.to.equal(null)
    expect(root.querySelector('[data-action="back"]')).to.equal(null)
    expect(root.querySelector('.lea-pagenav-finish-button')).to.equal(null)
  })

  it('navigates next and back in preview mode and shows finish on the last page', async () => {
    const root = await render('taskPageRenderer', {
      doc: doc(),
      isPreview: true,
    })
    await waitFor(() => pageText(root) === 'First', 'first page')
    root.querySelector('[data-action="next"]').click()
    await waitFor(() => pageText(root) === 'Second', 'second page')
    expect(root.querySelector('[data-action="next"]')).to.equal(null)
    expect(root.querySelector('.lea-pagenav-finish-button')).not.to.equal(null)
    root.querySelector('[data-action="back"]').click()
    await waitFor(() => pageText(root) === 'First', 'previous page')
    expect(root.querySelector('[data-action="back"]')).to.equal(null)
  })

  it('waits for the onNewPage acknowledgement before replacing page content', async () => {
    const onNewPage = sandbox.spy()
    const unit = doc()
    const root = await render('taskPageRenderer', { doc: unit, onNewPage })
    await waitFor(() => pageText(root) === 'First', 'initial page')
    root.querySelector('[data-action="next"]').click()
    await afterFlush()
    expect(onNewPage.calledOnce).to.equal(true)
    const [transition, acknowledge] = onNewPage.firstCall.args
    expect(transition).to.deep.equal({
      action: 'next',
      newPage: {
        currentPageCount: 1,
        currentPage: unit.pages[1],
        hasNext: false,
      },
    })
    expect(root.querySelector('.lea-unit-current-content')).to.equal(null)
    expect(
      root.querySelector('.lea-unit-current-content-container').textContent,
    ).to.include('Loading')
    acknowledge()
    await waitFor(() => pageText(root) === 'Second', 'acknowledged page')
  })

  it('requires evaluation of learning items and forwards scores as read-only feedback', async () => {
    const unit = doc()
    unit.pages[0].content[0].type = 'item'
    const scores = [{ itemId: 'First', score: 1 }]
    let resolve
    const onEvaluate = sandbox.stub().returns(
      new Promise((done) => {
        resolve = done
      }),
    )
    const root = await render('taskPageRenderer', {
      doc: unit,
      isLearning: true,
      onEvaluate,
    })
    await waitFor(() => pageText(root) === 'First', 'learning item')
    expect(root.querySelector('[data-action="next"]')).to.equal(null)
    root.querySelector('.lea-evaluate-btn').click()
    expect(onEvaluate.calledOnce).to.equal(true)
    expect(root.querySelector('[data-action="next"]')).to.equal(null)
    resolve(scores)
    await waitFor(
      () => root.querySelector('[data-action="next"]'),
      'navigation after evaluation',
    )
    expect(root.querySelector('.lea-evaluate-btn')).to.equal(null)
    const data = Blaze.getData(
      root.querySelector('.lea-unit-current-content .embed-responsive'),
    )
    expect(data.readOnly).to.equal(true)
    expect(data.scores).to.deep.equal(scores)
  })

  it('allows empty content pages to advance without evaluation', async () => {
    const unit = doc()
    unit.pages[0].content = []
    const onEvaluate = sandbox.spy()
    const root = await render('taskPageRenderer', {
      doc: unit,
      isLearning: true,
      onEvaluate,
    })
    expect(root.querySelector('.lea-evaluate-btn')).to.equal(null)
    root.querySelector('[data-action="next"]').click()
    await waitFor(() => pageText(root) === 'Second', 'page after empty content')
    expect(onEvaluate.called).to.equal(false)
  })

  it('resumes a requested page and hides backward navigation outside preview mode', async () => {
    const root = await render('taskPageRenderer', {
      doc: doc(),
      currentPageCount: 1,
    })
    await waitFor(() => pageText(root) === 'Second', 'resumed page')
    expect(root.querySelector('[data-action="back"]')).to.equal(null)
  })

  it('resets an out-of-range initial page index to zero', async () => {
    const root = await render('taskPageRenderer', {
      doc: doc(),
      currentPageCount: 5,
    })
    await waitFor(() => pageText(root) === 'First', 'reset page')
    expect(root.querySelector('[data-action="next"]')).not.to.equal(null)
  })

  it('renders stimuli, story and page-specific instructions', async () => {
    const unit = doc()
    unit.stimuli = [content('Stimulus')]
    unit.story = [content('Story')]
    unit.instructions = [content('Unit instruction')]
    unit.pages[0].instructions = [content('Page instruction')]
    const root = await render('taskPageRenderer', { doc: unit })
    await waitFor(
      () => root.textContent.includes('Page instruction'),
      'page instruction',
    )
    expect(root.textContent).to.include('Stimulus')
    expect(root.textContent).to.include('Story')
    expect(root.textContent).not.to.include('Unit instruction')
  })

  it('uses unit instructions and hides evaluation and finish for story pages', async () => {
    const unit = {
      _id: 'story',
      instructions: [content('Unit instruction')],
      pages: [{ content: [content('Story item', 'item')] }],
    }
    const onEvaluate = sandbox.spy()
    const root = await render('taskPageRenderer', {
      doc: unit,
      isStory: true,
      isLearning: true,
      onEvaluate,
    })
    await waitFor(
      () => root.textContent.includes('Unit instruction'),
      'unit instruction',
    )
    expect(root.querySelector('.lea-evaluate-btn')).to.equal(null)
    expect(root.querySelector('.lea-pagenav-finish-button')).to.equal(null)
    expect(onEvaluate.called).to.equal(false)
  })
})
