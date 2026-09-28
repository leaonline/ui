import { expect } from 'chai'
import { ReactiveVar } from 'meteor/reactive-var'
import {
  createRendererTestContext,
  waitFor,
} from '../../../tests/rendererHelpers.tests'
import { Markdown } from '../markdownRenderer'

describe('markdownRenderer', () => {
  const { render, setup, teardown, sandbox, afterFlush } =
    createRendererTestContext()
  let originalRenderer
  beforeEach(() => {
    setup()
    originalRenderer = Markdown.renderer
  })
  afterEach(() => {
    teardown()
    Markdown.renderer = originalRenderer
  })

  it('keeps the renderer unless initialization supplies a replacement', () => {
    Markdown.init()
    expect(Markdown.renderer).to.equal(originalRenderer)
    Markdown.init({ renderer: null })
    expect(Markdown.renderer).to.equal(originalRenderer)
    const renderer = async () => '<p>custom</p>'
    Markdown.init({ renderer })
    expect(Markdown.renderer).to.equal(renderer)
  })

  it('passes the full data to the asynchronous renderer and displays its HTML', async () => {
    let resolve
    const renderer = sandbox.stub().returns(
      new Promise((done) => {
        resolve = done
      }),
    )
    Markdown.init({ renderer })
    const data = {
      value: '# Heading',
      padding: 2,
      lineHeight: 3,
      background: 'dark',
      textColor: 'light',
      useTTS: true,
    }
    const root = await render('markdownRenderer', data)
    expect(renderer.calledOnceWithExactly(data)).to.equal(true)
    expect(root.querySelector('h1')).to.equal(null)
    resolve('<h1>Heading</h1>')
    await waitFor(() => root.querySelector('h1'), 'rendered markdown')
    expect(root.querySelector('h1').textContent).to.equal('Heading')
    for (const name of [
      'w-100',
      'lea-text',
      'p-2',
      'line-height-3',
      'bg-dark',
      'text-light',
    ]) {
      expect(root.firstElementChild.classList.contains(name), name).to.equal(
        true,
      )
    }
  })

  it('ignores non-string input and renders subsequent string values reactively', async () => {
    const renderer = sandbox
      .stub()
      .callsFake(async ({ value }) => `<p>${value}</p>`)
    Markdown.init({ renderer })
    const data = new ReactiveVar({ value: null })
    const root = await render('markdownRenderer', () => data.get())
    expect(renderer.called).to.equal(false)
    expect(root.firstElementChild.textContent.trim()).to.equal('')
    expect(root.firstElementChild.classList.contains('p-0')).to.equal(false)

    data.set({ value: 'First' })
    await waitFor(
      () => root.querySelector('p')?.textContent === 'First',
      'first markdown value',
    )
    data.set({ value: '' })
    await waitFor(
      () =>
        renderer.callCount === 2 && root.querySelector('p')?.textContent === '',
      'empty markdown value',
    )
    data.set({ value: 42 })
    await afterFlush()
    expect(renderer.callCount).to.equal(2)
  })
})
