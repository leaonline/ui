import { expect } from 'chai'
import { Blaze } from 'meteor/blaze'
import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { ReactiveVar } from 'meteor/reactive-var'
import {
  createRendererTestContext,
  waitFor,
} from '../../../tests/rendererHelpers.tests'
import { TaskRenderers } from '../../Renderers'
import '../../embed/embeddedResourceRenderer'
import '../TaskRendererFactory'

describe('TaskRendererFactory', () => {
  const { render, setup, teardown, sandbox, afterFlush } =
    createRendererTestContext()
  let registry
  let registered
  const register = (overrides = {}) => {
    const renderer = {
      name: `factory-test-${Random.id()}`,
      template: 'embeddedResourceRenderer',
      load: sandbox.stub().resolves(),
      ...overrides,
    }
    registry = TaskRenderers.registerRenderer(renderer)
    registered.push(renderer.name)
    return renderer
  }
  beforeEach(() => {
    setup()
    registered = []
  })
  afterEach(() => {
    teardown()
    registered.forEach((name) => registry.delete(name))
  })

  it('shows loading until the renderer resolves and forwards content, type and initialization options', async () => {
    let resolve
    const options = { example: true }
    const load = sandbox.stub().returns(
      new Promise((done) => {
        resolve = done
      }),
    )
    const renderer = register({ load, __initOptions: options })
    const onLoadComplete = sandbox.spy()
    const onLoadError = sandbox.spy()
    const content = {
      subtype: renderer.name,
      value: '<p>Loaded</p>',
      onLoadComplete,
      onLoadError,
    }
    const root = await render('TaskRendererFactory', {
      content,
      type: 'success',
    })
    expect(root.textContent.trim()).to.equal('Loading')
    expect(load.calledOnceWithExactly(options)).to.equal(true)
    expect(onLoadComplete.called).to.equal(false)

    resolve()
    await waitFor(
      () => root.querySelector('.embed-responsive'),
      'factory renderer',
    )
    expect(root.querySelector('p').textContent).to.equal('Loaded')
    expect(root.textContent).not.to.include('Loading')
    expect(Blaze.getData(root.querySelector('.embed-responsive'))).to.include({
      subtype: renderer.name,
      type: 'success',
      value: content.value,
    })
    expect(onLoadComplete.calledOnceWithExactly(renderer.name)).to.equal(true)
    expect(onLoadError.called).to.equal(false)
  })

  it('reuses a loaded subtype when content changes', async () => {
    const renderer = register()
    const onLoadComplete = sandbox.spy()
    const data = new ReactiveVar({
      content: {
        subtype: renderer.name,
        value: '<p>First</p>',
        onLoadComplete,
      },
    })
    const root = await render('TaskRendererFactory', () => data.get())
    await waitFor(
      () => root.querySelector('p')?.textContent === 'First',
      'first content',
    )
    data.set({
      content: {
        subtype: renderer.name,
        value: '<p>Second</p>',
        onLoadComplete,
      },
      type: 'info',
    })
    await afterFlush()
    expect(root.querySelector('p').textContent).to.equal('Second')
    expect(
      Blaze.getData(root.querySelector('.embed-responsive')).type,
    ).to.equal('info')
    expect(renderer.load.calledOnce).to.equal(true)
    expect(onLoadComplete.calledOnce).to.equal(true)
  })

  it('loads a different renderer when the subtype changes', async () => {
    const first = register()
    const second = register()
    const data = new ReactiveVar({
      content: { subtype: first.name, value: '<p>First</p>' },
    })
    const root = await render('TaskRendererFactory', () => data.get())
    await waitFor(() => root.querySelector('p'), 'first renderer')
    data.set({ content: { subtype: second.name, value: '<em>Second</em>' } })
    await waitFor(() => root.querySelector('em'), 'second renderer')
    expect(root.querySelector('p')).to.equal(null)
    expect(first.load.calledOnce).to.equal(true)
    expect(second.load.calledOnce).to.equal(true)
  })

  it('reports an unknown subtype through its callback and visible error', async () => {
    const log = sandbox.stub(console, 'error')
    const onLoadError = sandbox.spy()
    const subtype = `unknown-${Random.id()}`
    const root = await render('TaskRendererFactory', {
      content: { subtype, onLoadError },
    })
    expect(onLoadError.calledOnce).to.equal(true)
    const [error, failedSubtype] = onLoadError.firstCall.args
    expect(error).to.be.an.instanceOf(Meteor.Error)
    expect(error).to.include({
      error: 'taskRenderers.error',
      reason: 'taskRenderers.missing',
      details: subtype,
    })
    expect(failedSubtype).to.equal(subtype)
    expect(log.calledOnceWithExactly(error)).to.equal(true)
    expect(root.querySelector('.alert-danger').textContent).to.include(
      'translated:taskRenderers.missing',
    )
  })

  it('reports rejected loads without calling the success callback', async () => {
    const error = new Meteor.Error('load.failed', 'load.reason')
    sandbox.stub(console, 'error')
    const renderer = register({ load: sandbox.stub().rejects(error) })
    const onLoadError = sandbox.spy()
    const onLoadComplete = sandbox.spy()
    const root = await render('TaskRendererFactory', {
      content: { subtype: renderer.name, onLoadError, onLoadComplete },
    })
    await waitFor(
      () => root.querySelector('.alert-danger'),
      'factory load error',
    )
    expect(onLoadError.calledOnceWithExactly(error, renderer.name)).to.equal(
      true,
    )
    expect(onLoadComplete.called).to.equal(false)
    expect(root.querySelector('.embed-responsive')).to.equal(null)
    expect(root.querySelector('.alert-danger').textContent).to.include(
      'translated:load.reason',
    )
  })
})
