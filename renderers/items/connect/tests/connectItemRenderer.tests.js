import { expect } from 'chai'
import { ReactiveVar } from 'meteor/reactive-var'
import {
  createRendererTestContext,
  renderedText,
} from '../../../../tests/rendererHelpers.tests'
import '../connectItemRenderer'

const template = 'connectItemRenderer'
describe(template, () => {
  const { render, setup, teardown, sandbox, afterFlush } =
    createRendererTestContext()
  let observer
  let resize
  const fixture = (extra = {}) => ({
    contentId: 'connect-a',
    color: 'primary',
    onInput: sandbox.spy(),
    value: {
      left: [{ text: 'Cat' }, { text: 'Dog' }],
      right: [{ text: 'Meow' }, { text: 'Woof' }],
    },
    ...extra,
  })
  const connect = async (root, from = 0, to = 0) => {
    const source = root.querySelector(`.connect-source[data-index="${from}"]`)
    const target = root.querySelector(`.connect-dropzone[data-index="${to}"]`)
    const dataTransfer = new DataTransfer()
    source.dispatchEvent(
      new DragEvent('dragstart', { bubbles: true, dataTransfer }),
    )
    target.dispatchEvent(
      new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }),
    )
    await afterFlush()
  }
  beforeEach(() => {
    setup()
    observer = { observe: sandbox.spy(), disconnect: sandbox.spy() }
    sandbox.stub(window, 'ResizeObserver').callsFake((callback) => {
      resize = callback
      return observer
    })
  })
  afterEach(teardown)

  it('renders source and target text with independently indexed draggable sources', async () => {
    const root = await render(template, fixture())
    const sources = [...root.querySelectorAll('.connect-source')]
    expect(sources.map((element) => element.textContent.trim())).to.deep.equal([
      'Cat',
      'Dog',
    ])
    expect(sources.map((element) => element.dataset.index)).to.deep.equal([
      '0',
      '1',
    ])
    expect(sources.every((element) => element.draggable)).to.equal(true)
    expect(
      [...root.querySelectorAll('.connect-dropzone')].map((element) =>
        element.textContent.trim(),
      ),
    ).to.deep.equal(['Meow', 'Woof'])
    expect(root.querySelector('.connect-line')).to.equal(null)
    expect(observer.observe.callCount).to.equal(5)
  })

  it('draws a dropped connection, submits its endpoint indexes and ignores duplicates', async () => {
    const data = fixture()
    const root = await render(template, data)
    await connect(root, 0, 1)
    expect(root.querySelectorAll('.connect-line')).to.have.length(1)
    expect(root.querySelector('line').getAttribute('stroke')).to.equal(
      'var(--bs-primary)',
    )
    expect(root.querySelector('.connect-remove-btn').dataset).to.include({
      from: '0',
      to: '1',
    })
    expect(
      data.onInput.calledOnceWithExactly({ ...data, responses: ['0,1'] }),
    ).to.equal(true)
    await connect(root, 0, 1)
    expect(root.querySelectorAll('.connect-line')).to.have.length(1)
    expect(data.onInput.calledOnce).to.equal(true)
  })

  it('removes only the requested connection and submits the remaining response on destruction', async () => {
    const data = fixture()
    const root = await render(template, data)
    await connect(root, 0, 0)
    await connect(root, 1, 1)
    root.querySelector('.connect-remove-btn[data-from="0"]').click()
    await afterFlush()
    expect(root.querySelectorAll('.connect-line')).to.have.length(1)
    expect(root.querySelector('.connect-remove-btn').dataset.from).to.equal('1')
    teardown()
    expect(data.onInput.lastCall.args).to.deep.equal([
      { ...data, responses: ['1,1'] },
    ])
  })

  it('restores valid cached connections and ignores nonexistent endpoints', async () => {
    const onLoad = sandbox
      .stub()
      .returns({ responses: ['1,0', '99,0', '0,99'] })
    const data = fixture({ onLoad, readOnly: true })
    const root = await render(template, data)
    expect(onLoad.calledOnceWithExactly(data)).to.equal(true)
    expect(root.querySelectorAll('.connect-line')).to.have.length(1)
    expect(root.querySelector('.connect-draggable')).to.equal(null)
    expect(root.querySelector('.connect-remove-btn')).to.equal(null)
    teardown()
    expect(data.onInput.lastCall.args[0].responses).to.deep.equal(['1,0'])
  })

  for (const [to, color] of [
    [0, 'success'],
    [1, 'danger'],
  ]) {
    it(`marks an existing connection ${color} after scoring`, async () => {
      const data = new ReactiveVar(fixture())
      const root = await render(template, () => data.get())
      await connect(root, 0, to)
      data.set({
        ...data.get(),
        scores: [
          { itemId: 'connect-a', correctResponse: [{ left: 0, right: 0 }] },
        ],
      })
      await afterFlush()
      expect(root.querySelector('line').getAttribute('stroke')).to.equal(
        `var(--bs-${color})`,
      )
    })
  }

  it('draws missed expected connections and displays item and score explanations', async () => {
    const initial = fixture()
    initial.value.explanation = 'Match each animal'
    const data = new ReactiveVar(initial)
    const root = await render(template, () => data.get())
    data.set({
      ...initial,
      readOnly: true,
      scores: [
        {
          itemId: 'connect-a',
          correctResponse: [
            { left: 0, right: 0 },
            { left: 1, right: 1 },
          ],
          explanation: 'Listen to the sounds',
        },
      ],
    })
    await afterFlush()
    const lines = [...root.querySelectorAll('line')]
    expect(lines).to.have.length(2)
    expect(
      lines.every(
        (line) => line.getAttribute('stroke') === 'var(--bs-secondary)',
      ),
    ).to.equal(true)
    expect(root.querySelector('.connect-remove-btn')).to.equal(null)
    expect(renderedText(root.querySelector('.choice-explanation'))).to.include(
      'Match each animal',
    )
    expect(renderedText(root.querySelector('.choice-explanation'))).to.include(
      'Listen to the sounds',
    )
  })

  it('does not draw expected connections belonging to another item', async () => {
    const data = new ReactiveVar(fixture())
    const root = await render(template, () => data.get())
    data.set({
      ...data.get(),
      scores: [
        {
          itemId: 'other-item',
          correctResponse: [
            { left: 0, right: 0 },
            { left: 1, right: 1 },
          ],
        },
      ],
    })
    await afterFlush()
    expect(root.querySelector('.connect-line')).to.equal(null)
  })

  it('disconnects observers, removes the resize listener and cancels scheduled work', async () => {
    const remove = sandbox.spy(window, 'removeEventListener')
    const cancel = sandbox.spy(window, 'cancelAnimationFrame')
    await render(template, fixture())
    resize()
    teardown()
    expect(observer.disconnect.calledOnce).to.equal(true)
    expect(remove.calledWith('resize', resize)).to.equal(true)
    expect(cancel.callCount).to.be.at.least(2)
  })
})
