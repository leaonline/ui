import { expect } from 'chai'
import { ReactiveVar } from 'meteor/reactive-var'
import {
  createRendererTestContext,
  renderedText,
} from '../../../tests/rendererHelpers.tests'
import '../textgroup'

describe('textGroup', () => {
  const { render, setup, teardown, afterFlush } = createRendererTestContext()
  beforeEach(setup)
  afterEach(teardown)

  it('renders explicit text, speech data, alignment and custom classes', async () => {
    const root = await render('textGroup', {
      text: 'Read this aloud',
      tts: 'unused.key',
      align: 'center',
      groupClass: 'custom-group',
      class: 'custom-text',
      type: 'success',
      bold: true,
    })
    const wrapper = root.firstElementChild
    const text = wrapper.querySelector('.text-wrapper')
    const sound = wrapper.querySelector('.lea-sound-btn')

    expect(wrapper.classList.contains('align-items-center')).to.equal(true)
    expect(wrapper.classList.contains('custom-group')).to.equal(true)
    expect(renderedText(text)).to.equal('Read this aloud')
    expect(text.classList.contains('ms-3')).to.equal(true)
    expect(text.classList.contains('custom-text')).to.equal(true)
    expect(text.classList.contains('lea-text-bold')).to.equal(true)
    expect(sound.getAttribute('data-text')).to.equal('Read this aloud')
    expect(sound.hasAttribute('data-tts')).to.equal(false)
    expect(sound.classList.contains('btn-outline-success')).to.equal(true)
  })

  it('translates a TTS key and defaults to start alignment', async () => {
    const root = await render('textGroup', { tts: 'task.instructions' })

    expect(
      root.firstElementChild.classList.contains('align-items-start'),
    ).to.equal(true)
    expect(renderedText(root.querySelector('.text-wrapper'))).to.equal(
      'translated:task.instructions',
    )
    expect(
      root.querySelector('.lea-sound-btn').getAttribute('data-tts'),
    ).to.equal('task.instructions')
  })

  it('suppresses automatic text only for an explicit false', async () => {
    const data = new ReactiveVar({ tts: 'task.instructions', autoText: false })
    const root = await render('textGroup', () => data.get())
    expect(root.querySelector('.text-wrapper')).to.equal(null)
    expect(root.querySelector('.lea-sound-btn')).not.to.equal(null)

    data.set({ tts: 'task.instructions', autoText: 0 })
    await afterFlush()
    expect(renderedText(root.querySelector('.text-wrapper'))).to.equal(
      'translated:task.instructions',
    )

    data.set({ text: 'Explicit text', autoText: false })
    await afterFlush()
    expect(renderedText(root.querySelector('.text-wrapper'))).to.equal(
      'Explicit text',
    )
  })
})
