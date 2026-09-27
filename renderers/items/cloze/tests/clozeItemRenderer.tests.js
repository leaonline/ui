/* eslint-env mocha */
import { expect } from 'chai'
import { createTemplateRenderingContext } from '../../../../tests/blazeHelpers.tests'
import '../clozeItemRenderer'

const template = 'clozeItemRenderer'

describe('clozeItemRenderer', () => {
  const { render, setup, teardown } = createTemplateRenderingContext()
  beforeEach(() => setup())
  afterEach(() => teardown())

  describe('item inputs', () => {
    it('renders text without any item', async () => {
      const root = await render(template, {
        value: {
          text: 'Hello, world!',
          isTable: false,
          flavor: 2,
        },
        color: 'primary',
      })
      const wrapper = root.firstElementChild
      expect(wrapper.querySelectorAll('.cloze-input-group').length).to.equal(0)
      expect(wrapper.querySelectorAll('.cloze-token').length).to.equal(1)
    })

    it('renders text with a single blanks item')
    it('renders text with multiple blanks items')
    it('renders text with a single select items')
    it('renders text with multiple select items')
    it('renders text with mixed blanks and select items')
  })

  describe('scoring feedback', () => {
    it('shows successfully scored blanks')
    it('shows successfully scored selects')
    it('shows failed blanks')
    it('shows failed selectes')
    it('shows missing blanks')
    it('shows missing selects')
  })
})
