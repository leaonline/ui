/* eslint-env mocha */
import { expect } from 'chai'
import { withRenderedTemplate } from '../../../../tests/blazeHelpers.tests'
import '../clozeItemRenderer'

const template = 'clozeItemRenderer'

describe('clozeItemRenderer', () => {
  it('renders text without any item', (done) => {
    const data = {
      value: 'Hello, world!',
      color: 'primary',
    }

    withRenderedTemplate(template, data, (root) => {
      expect(root.querySelectorAll('.cloze-input-group').length).to.equal(0)
      expect(root.querySelectorAll('.cloze-token').length).to.equal(2)
      done()
    })
  })
})
