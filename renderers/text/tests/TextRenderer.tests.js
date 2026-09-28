import { expect } from 'chai'
import { ReactiveVar } from 'meteor/reactive-var'
import {
  createRendererTestContext,
  renderedText,
} from '../../../tests/rendererHelpers.tests'
import '../textRenderer'

describe('textRenderer', () => {
  const { render, setup, teardown, afterFlush } = createRendererTestContext()
  beforeEach(setup)
  afterEach(teardown)

  it('forwards text, classes and color to its text group', async () => {
    const root = await render('textRenderer', {
      value: 'A short instruction',
      class: 'instruction',
      groupClass: 'instruction-group',
      type: 'info',
    })
    expect(root.querySelector('.instruction-group')).not.to.equal(null)
    expect(renderedText(root.querySelector('.instruction'))).to.equal(
      'A short instruction',
    )
    const sound = root.querySelector('.lea-sound-btn')
    expect(sound.getAttribute('data-text')).to.equal('A short instruction')
    expect(sound.classList.contains('btn-outline-info')).to.equal(true)
  })

  it('switches reactively between visible text and a large speech button', async () => {
    const data = new ReactiveVar({
      value: 'Listen to this',
      hidden: true,
      type: 'primary',
    })
    const root = await render('textRenderer', () => data.get())
    expect(root.querySelector('.text-wrapper')).to.equal(null)
    const sound = root.querySelector('.lea-sound-btn')
    expect(sound.classList.contains('btn-lg')).to.equal(true)
    expect(sound.classList.contains('w-100')).to.equal(true)
    expect(sound.getAttribute('data-text')).to.equal('Listen to this')

    data.set({ value: 'Now read this', hidden: false })
    await afterFlush()
    expect(renderedText(root.querySelector('.text-wrapper'))).to.equal(
      'Now read this',
    )
    expect(root.querySelectorAll('.lea-sound-btn')).to.have.length(1)
  })
})
