/* eslint-env mocha */
import { expect } from 'chai'
import { TTSEngine } from 'meteor/leaonline:corelib/tts/TTSEngine'
import { createTemplateRenderingContext } from '../../../tests/blazeHelpers.tests'
import '../soundbutton'

describe('soundbutton', () => {
  const { render, setup, teardown } = createTemplateRenderingContext()
  beforeEach(() => setup())
  afterEach(() => teardown())

  it('renders stable sound-button attributes without playing TTS', async () => {
    TTSEngine.isConfigured = () => true

    const root = await render('soundbutton', {
      id: 'sound-control',
      title: 'Read instructions',
      tts: 'tts-id',
      text: 'Instructions',
      type: 'info',
      outline: true,
      class: 'custom-sound',
    })
    const button = root.querySelector('button.lea-sound-btn')

    expect(button.id).to.equal('sound-control')
    expect(button.type).to.equal('button')
    expect(button.title).to.equal('Read instructions')
    expect(button.getAttribute('data-tts')).to.equal('tts-id')
    expect(button.getAttribute('data-text')).to.equal('Instructions')
    expect(button.getAttribute('aria-label')).to.equal('Read instructions')
    expect(button.getAttribute('aria-hidden')).to.equal('true')
    expect(button.classList.contains('btn-outline-info')).to.equal(true)
    expect(button.classList.contains('custom-sound')).to.equal(true)
  })
})
