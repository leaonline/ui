import { expect } from 'chai'
import { ReactiveVar } from 'meteor/reactive-var'
import Sortable from 'sortablejs'
import {
  createRendererTestContext,
  renderedText,
} from '../../../../tests/rendererHelpers.tests'
import '../sortItemRenderer'

const template = 'sortItemRenderer'
describe(template, () => {
  const { render, setup, teardown, sandbox, afterFlush } =
    createRendererTestContext()
  let sortable
  let options
  const fixture = (extra = {}) => ({
    contentId: 'sort-a',
    color: 'info',
    onInput: sandbox.spy(),
    value: { list: [{ text: 'First' }, { text: 'Second' }, { text: 'Third' }] },
    ...extra,
  })
  const reorder = async (root, indexes) => {
    const list = root.querySelector('.sortable-root')
    const entries = [...list.querySelectorAll('li')]
    indexes.forEach((index) => list.appendChild(entries[index]))
    options.onSort({ to: list })
    await afterFlush()
  }
  beforeEach(() => {
    setup()
    // Test the renderer's integration callback independently of Sortable's
    // pixel-dependent drag gestures.
    sortable = { sort: sandbox.spy() }
    sandbox.stub(Sortable, 'create').callsFake((element, config) => {
      options = config
      return sortable
    })
  })
  afterEach(teardown)

  it('renders indexed values and attaches Sortable to the correct list', async () => {
    const root = await render(template, fixture())
    const list = root.querySelector('.sortable-root')
    expect(
      [...list.children].map((element) => element.textContent.trim()),
    ).to.deep.equal(['First', 'Second', 'Third'])
    expect(
      [...list.children].map((element) => element.dataset.index),
    ).to.deep.equal(['0', '1', '2'])
    expect(Sortable.create.calledOnceWithExactly(list, options)).to.equal(true)
    expect(options).to.include({
      ghostClass: 'bg-secondary',
      dragClass: 'bg-secondary',
      chosenClass: 'bg-secondary',
    })
    expect(root.querySelector('.item-border-expected')).to.equal(null)
  })

  it('submits the new order, updates the hidden input and deduplicates repeated events', async () => {
    const data = fixture()
    const root = await render(template, data)
    await reorder(root, [2, 0, 1])
    expect(root.querySelector('.sortable-input').value).to.equal('2,0,1')
    expect(
      data.onInput.calledOnceWithExactly({ ...data, responses: ['2,0,1'] }),
    ).to.equal(true)
    options.onSort({ to: root.querySelector('.sortable-root') })
    expect(data.onInput.calledOnce).to.equal(true)
    teardown()
    expect(data.onInput.calledOnce).to.equal(true)
  })

  it('submits an omission marker when no sorting took place', async () => {
    const data = fixture()
    await render(template, data)
    teardown()
    expect(
      data.onInput.calledOnceWithExactly({
        ...data,
        responses: ['__undefined__'],
      }),
    ).to.equal(true)
  })

  it('honors the current read-only integration and calls the host cache loader', async () => {
    const onLoad = sandbox.stub().returns(null)
    const data = fixture({ readOnly: true, onLoad })
    await render(template, data)
    expect(sortable.sort).to.equal(false)
    expect(onLoad.calledOnceWithExactly(data)).to.equal(true)
  })

  for (const [name, order, correct, expectedClasses] of [
    ['correct', [0, 1, 2], true, ['bg-success', 'bg-success', 'bg-success']],
    [
      'partially correct',
      [1, 0, 2],
      false,
      ['bg-danger', 'bg-danger', 'bg-success'],
    ],
  ]) {
    it(`renders ${name} scoring and the expected order when needed`, async () => {
      const initial = fixture()
      initial.value.explanation = 'Put the entries in order'
      const data = new ReactiveVar(initial)
      const root = await render(template, () => data.get())
      await reorder(root, order)
      data.set({
        ...initial,
        scores: [
          {
            itemId: 'sort-a',
            correctResponse: [0, 1, 2],
            explanation: 'First comes first',
          },
        ],
      })
      await afterFlush()
      const list = root.querySelector('.sortable-root')
      expect(
        list.classList.contains(`border-${correct ? 'success' : 'danger'}`),
      ).to.equal(true)
      expectedClasses.forEach((name, index) => {
        expect(
          list
            .querySelector(`[data-index="${index}"]`)
            .classList.contains(name),
        ).to.equal(true)
      })
      const expected = root.querySelector('.item-border-expected')
      if (correct) expect(expected).to.equal(null)
      else
        expect(
          [...expected.querySelectorAll('li')].map((element) =>
            element.textContent.trim(),
          ),
        ).to.deep.equal(['First', 'Second', 'Third'])
      expect(
        renderedText(root.querySelector('.choice-explanation')),
      ).to.include('Put the entries in order')
      expect(
        renderedText(root.querySelector('.choice-explanation')),
      ).to.include('First comes first')
    })
  }
})
