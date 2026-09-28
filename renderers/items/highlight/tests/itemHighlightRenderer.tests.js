import { expect } from 'chai'
import { ReactiveVar } from 'meteor/reactive-var'
import {
  createRendererTestContext,
  renderedText,
} from '../../../../tests/rendererHelpers.tests'
import '../itemHighlightRenderer'

const template = 'itemHighlightRenderer'
describe(template, () => {
  const { render, setup, teardown, sandbox, afterFlush, hover } =
    createRendererTestContext()
  beforeEach(setup)
  afterEach(teardown)
  const fixture = (extra = {}) => ({
    contentId: 'highlight-a',
    value: { text: 'cat dog bird' },
    color: 'info',
    onInput: sandbox.spy(),
    ...extra,
  })

  it('renders grouped tokens, punctuation and optional speech', async () => {
    const root = await render(
      template,
      fixture({ value: { text: 'Hello {{two words}}, world', tts: true } }),
    )
    expect(
      [...root.querySelectorAll('.highlight-entry')].map(
        (element) => element.textContent,
      ),
    ).to.deep.equal(['Hello', 'two words', ',', 'world'])
    expect(
      root.querySelectorAll('.highlight-entry')[2].classList.contains('ms-n2'),
    ).to.equal(true)
    expect(
      root.querySelector('.lea-sound-btn').getAttribute('data-text'),
    ).to.equal('Hello {{two words}}, world')
  })

  it('makes whitespace selectable only when includeSpace is enabled', async () => {
    const data = new ReactiveVar(
      fixture({ value: { text: 'cat  dog', includeSpace: false } }),
    )
    const root = await render(template, () => data.get())
    expect(
      root
        .querySelector('[data-isSpace="true"]')
        .classList.contains('highlight-token'),
    ).to.equal(false)
    data.set({ ...data.get(), value: { text: 'cat  dog', includeSpace: true } })
    await afterFlush()
    expect(
      root
        .querySelector('[data-isSpace="true"]')
        .classList.contains('highlight-token'),
    ).to.equal(true)
    expect(root.querySelector('.lea-sound-btn')).to.equal(null)
  })

  it('toggles selection and submits ordered token indexes and omitted responses', async () => {
    const data = fixture()
    const root = await render(template, data)
    const token = (index) => root.querySelector(`[data-index="${index}"]`)
    token(1).click()
    await afterFlush()
    expect(data.onInput.lastCall.args).to.deep.equal([
      { ...data, responses: ['1'] },
    ])
    expect(token(1).classList.contains('bg-info')).to.equal(true)
    token(0).click()
    await afterFlush()
    expect(data.onInput.lastCall.args[0].responses).to.deep.equal(['0', '1'])
    token(1).click()
    token(0).click()
    await afterFlush()
    expect(root.querySelector('.highlight-selected')).to.equal(null)
    expect(data.onInput.lastCall.args[0].responses).to.deep.equal([
      '__undefined__',
    ])
  })

  it('shows hover feedback and removes it on mouseout', async () => {
    const root = await render(template, fixture())
    const token = root.querySelector('.highlight-token')
    await hover(token)
    await afterFlush()
    expect(token.classList.contains('highlight-hovered')).to.equal(true)
    token.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }))
    await afterFlush()
    expect(token.classList.contains('highlight-hovered')).to.equal(false)
  })

  it('shows correct, incorrect and missing selections with explanations', async () => {
    const initial = fixture()
    initial.value.explanation = 'Find the animals'
    const data = new ReactiveVar(initial)
    const root = await render(template, () => data.get())
    root.querySelector('[data-index="0"]').click()
    root.querySelector('[data-index="1"]').click()
    await afterFlush()
    data.set({
      ...initial,
      scores: [
        {
          itemId: 'highlight-a',
          correctResponse: [0, 2],
          explanation: 'Select cat and bird',
        },
      ],
      readOnly: true,
    })
    await afterFlush()
    expect(
      root.querySelector('[data-index="0"]').classList.contains('bg-success'),
    ).to.equal(true)
    expect(
      root.querySelector('[data-index="1"]').classList.contains('bg-danger'),
    ).to.equal(true)
    expect(
      root
        .querySelector('[data-index="2"]')
        .classList.contains('item-border-expected'),
    ).to.equal(true)
    expect(root.querySelector('.highlight-token')).to.equal(null)
    expect(renderedText(root.querySelector('.choice-explanation'))).to.include(
      'Find the animals',
    )
    expect(renderedText(root.querySelector('.choice-explanation'))).to.include(
      'Select cat and bird',
    )
    const submitted = initial.onInput.callCount
    root.querySelector('[data-index="2"]').click()
    expect(initial.onInput.callCount).to.equal(submitted)
  })

  it('ignores scoring belonging to a different item', async () => {
    const root = await render(
      template,
      fixture({ scores: [{ itemId: 'other', correctResponse: [0] }] }),
    )
    expect(root.querySelector('.item-border-expected')).to.equal(null)
    expect(root.querySelector('.bg-success')).to.equal(null)
    expect(root.querySelector('.bg-danger')).to.equal(null)
  })
})
