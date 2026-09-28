import { expect } from 'chai'
import {
  createRendererTestContext,
  renderedText,
} from '../../../../tests/rendererHelpers.tests'
import '../../../../components/textgroup/textgroup'
import '../itemExplanations'

describe('itemExplanations', () => {
  const { render, setup, teardown } = createRendererTestContext()
  beforeEach(setup)
  afterEach(teardown)

  it('renders a translated heading and each explanation with speech controls', async () => {
    const root = await render('itemExplanations', {
      explanations: ['General explanation', 'Specific explanation'],
      color: 'info',
    })
    const texts = [...root.querySelectorAll('.text-wrapper')]
    expect(texts.map(renderedText)).to.deep.equal([
      'translated:task.explanation',
      'General explanation',
      'Specific explanation',
    ])
    expect(texts[0].classList.contains('lea-text-bold')).to.equal(true)
    const buttons = [...root.querySelectorAll('.lea-sound-btn')]
    expect(buttons).to.have.length(3)
    expect(
      buttons.map((button) => button.getAttribute('data-text')),
    ).to.deep.equal(texts.map(renderedText))
    expect(
      buttons.every((button) => button.classList.contains('btn-outline-info')),
    ).to.equal(true)
  })

  it('escapes explanation markup', async () => {
    const root = await render('itemExplanations', {
      explanations: ['<b>literal</b>'],
    })
    expect(root.querySelector('b')).to.equal(null)
    expect(renderedText(root.querySelectorAll('.text-wrapper')[1])).to.equal(
      '<b>literal</b>',
    )
  })

  it('renders the heading alone for no explanations', async () => {
    const empty = await render('itemExplanations', { explanations: [] })
    expect(empty.querySelectorAll('.text-wrapper')).to.have.length(1)
  })
})
