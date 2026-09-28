import { expect } from 'chai'
import { ReactiveVar } from 'meteor/reactive-var'
import { createTemplateRenderingContext } from '../../../tests/blazeHelpers.tests'
import '../documentRenderer'

describe('documentRenderer', () => {
  const { render, setup, teardown, afterFlush } =
    createTemplateRenderingContext()
  beforeEach(setup)
  afterEach(teardown)

  it('pretty prints documents, nested JSON and multiline strings', async () => {
    const root = await render('documentRenderer', {
      doc: {
        title: 'Example',
        nested: '{"count":2}',
        lines: 'first\n  second',
      },
    })
    expect(root.querySelector('pre > code').textContent).to.equal(
      '{\n  "title": "Example",\n  "nested": {\n    "count": 2\n  },\n  "lines": [\n    "first",\n    "second"\n  ]\n}',
    )
  })

  it('escapes markup in documents and updates its data reactively', async () => {
    const data = new ReactiveVar({ doc: { text: '<b>literal</b>' } })
    const root = await render('documentRenderer', () => data.get())
    expect(root.querySelector('b')).to.equal(null)
    expect(root.querySelector('code').textContent).to.include('<b>literal</b>')

    data.set({ doc: { changed: true } })
    await afterFlush()
    expect(root.querySelector('code').textContent).to.equal(
      '{\n  "changed": true\n}',
    )
  })
})
