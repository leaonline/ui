/* eslint-env mocha */
import { expect } from 'chai'
import { withRenderedTemplate } from '../../../../tests/blazeHelpers.tests'
import '../clozeItemRenderer'
// import { TTSEngine } from 'meteor/leaonline:corelib'

const template = 'clozeItemRenderer'

describe('clozeItemRenderer', function () {
  it('renders text without any item', function (done) {
    const data = {
      value: 'Hello, world!',
      color: 'primary'
    }

    withRenderedTemplate(template, data, root => {
      expect(root.querySelectorAll('.cloze-input-group').length).to.equal(0)
      expect(root.querySelectorAll('.cloze-token').length).to.equal(2)
      done()
    })
  })
})
