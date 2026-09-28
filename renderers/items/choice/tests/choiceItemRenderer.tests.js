/* eslint-env mocha */

import { expect } from 'chai'
import { Choice } from 'meteor/leaonline:corelib/items/choice/Choice'
import { Random } from 'meteor/random'
import sinon from 'sinon'
import {
  asyncTimeout,
  createTemplateRenderingContext,
} from '../../../../tests/blazeHelpers.tests'
import '../choiceItemRenderer'

const template = 'choiceItemRenderer'

describe(template, () => {
  const { render, setup, teardown, hover } = createTemplateRenderingContext()
  beforeEach(() => setup())
  afterEach(() => teardown())

  // data = { value, color, readOnly, isLearning, scores, contentId }
  // value = { choices, shuffle }
  describe('item inputs', () => {
    it('renders a simple single choice', async () => {
      const root = await render(template, {
        value: {
          choices: [
            { index: 0, text: 'moo' },
            { index: 1, text: 'bar' },
          ],
        },
      })
      const wrapper = root.firstElementChild
      const inputs = wrapper.querySelectorAll('input')
      expect(inputs.length).to.equal(2)

      // test radio group
      const [moo, bar] = inputs
      expect(moo.value).to.equal('0')
      expect(bar.value).to.equal('1')
      expect(moo.type).to.equal('radio')
      expect(bar.type).to.equal('radio')
      expect(moo.name).to.be.a('string')
      expect(bar.name).to.be.a('string')
      expect(moo.name).to.equal(bar.name)

      const labels = wrapper.querySelectorAll('.choice-label')
      expect(labels.length).to.equal(2)

      const [mooLabel, barLabel] = labels
      expect(mooLabel.textContent.trim()).to.equal('moo')
      expect(barLabel.textContent.trim()).to.equal('bar')
    })

    it('renders a simple multiple choice', async () => {
      const root = await render(template, {
        value: {
          flavor: Choice.flavors.multiple.value,
          choices: [
            { index: 0, text: 'moo' },
            { index: 1, text: 'bar' },
          ],
        },
      })
      const wrapper = root.firstElementChild
      const inputs = wrapper.querySelectorAll('input')
      expect(inputs.length).to.equal(2)

      // test radio group
      const [moo, bar] = inputs
      expect(moo.value).to.equal('0')
      expect(bar.value).to.equal('1')
      expect(moo.type).to.equal('checkbox')
      expect(bar.type).to.equal('checkbox')
      expect(moo.name).to.be.a('string')
      expect(bar.name).to.be.a('string')
      expect(moo.name).to.equal(bar.name)

      const [mooLabel, barLabel] = wrapper.querySelectorAll('.choice-label')
      expect(mooLabel.textContent.trim()).to.equal('moo')
      expect(barLabel.textContent.trim()).to.equal('bar')
    })

    it('default colors a single choice and multiple choice', async () => {
      const datas = [
        {
          flavor: Choice.flavors.single.value,
          value: {
            choices: [
              { index: 0, text: 'moo' },
              { index: 1, text: 'bar' },
            ],
          },
        },
        {
          flavor: Choice.flavors.multiple.value,
          value: {
            choices: [
              { index: 0, text: 'moo' },
              { index: 1, text: 'bar' },
            ],
          },
        },
      ]

      for (const data of datas) {
        const root = await render(template, data)
        const [moo, bar] = root.querySelectorAll('.choice-interaction')
        expect(moo.classList.contains('border-light')).to.equal(true)
        expect(bar.classList.contains('border-light')).to.equal(true)
        expect(moo.classList.contains('bg-light')).to.equal(false)
        expect(bar.classList.contains('bg-light')).to.equal(false)

        moo.click()
        await asyncTimeout(50)
        expect(moo.classList.contains('border-secondary')).to.equal(true)
        await asyncTimeout(50)
        bar.click()
        await asyncTimeout(50)
        expect(bar.classList.contains('border-secondary')).to.equal(true)
        await asyncTimeout(50)
        await hover(moo)
        await asyncTimeout(50)
        expect(moo.classList.contains('bg-light')).to.equal(true)
        await teardown()
      }
    })
  })

  describe('input', () => {
    it('submits item input from single choice', async () => {
      const onInput = sinon.fake()
      const data = {
        onInput,
        value: {
          choices: [
            { index: 0, text: 'moo' },
            { index: 1, text: 'bar' },
          ],
        },
      }
      const root = await render(template, data)
      const wrapper = root.firstElementChild
      const inputs = wrapper.querySelectorAll('input')
      expect(inputs.length).to.equal(2)

      // test radio group
      const [moo, bar] = inputs
      moo.click()
      await asyncTimeout(150)
      expect(onInput.calledOnce).to.equal(true)
      expect(onInput.firstCall.args).to.deep.equal([
        { responses: ['0'], ...data },
      ])

      await asyncTimeout(50)
      bar.click()
      await asyncTimeout(150)
      expect(onInput.calledTwice).to.equal(true)
      expect(onInput.secondCall.args).to.deep.equal([
        { responses: ['1'], ...data },
      ])
    })
    it('submits item input from multiple choice', async () => {
      const onInput = sinon.fake()
      const data = {
        onInput,
        value: {
          flavor: Choice.flavors.multiple.value,
          choices: [
            { index: 0, text: 'moo' },
            { index: 1, text: 'bar' },
          ],
        },
      }
      const root = await render(template, data)
      const wrapper = root.firstElementChild
      const inputs = wrapper.querySelectorAll('input')
      expect(inputs.length).to.equal(2)

      // test radio group
      const [moo, bar] = inputs
      moo.click()
      await asyncTimeout(150)
      expect(onInput.calledOnce).to.equal(true)
      expect(onInput.firstCall.args).to.deep.equal([
        { responses: ['0'], ...data },
      ])

      await asyncTimeout(50)
      bar.click()
      await asyncTimeout(150)
      expect(onInput.calledTwice).to.equal(true)
      expect(onInput.secondCall.args).to.deep.equal([
        { responses: ['0', '1'], ...data },
      ])
    })
  })

  describe('scoring feedback', () => {
    it('shows successfully scored single choice', async () => {
      const contentId = Random.id()
      const root = await render(template, {
        contentId,
        scores: [
          {
            itemId: contentId,
            correctResponse: [1],
          },
        ],
        value: {
          choices: [
            { index: 0, text: 'moo' },
            { index: 1, text: 'bar' },
          ],
        },
      })
      const wrapper = root.firstElementChild
      const inputs = wrapper.querySelectorAll('.choice-interaction')
      const [moo, bar] = inputs

      // show 1 as expected
      expect(bar.classList.contains('item-border-expected')).to.equal(true)
      expect(moo.classList.contains('item-border-expected')).to.equal(false)
      expect(moo.classList.contains('border-light')).to.equal(true)

      // show correct response
      await asyncTimeout(50)
      bar.click()
      await asyncTimeout(150)
      expect(bar.classList.contains('item-border-expected')).to.equal(false)
      expect(bar.classList.contains('border-success')).to.equal(true)
      expect(moo.classList.contains('item-border-expected')).to.equal(false)
      expect(moo.classList.contains('border-light')).to.equal(true)

      // show wrong response
      await asyncTimeout(50)
      moo.click()
      await asyncTimeout(150)
      expect(bar.classList.contains('item-border-expected')).to.equal(true)
      expect(bar.classList.contains('border-secondary')).to.equal(true)
      expect(moo.classList.contains('border-danger')).to.equal(true)
    })

    it('shows successfully scored multiple choice', async () => {
      const contentId = Random.id()
      const root = await render(template, {
        contentId,
        scores: [
          {
            itemId: contentId,
            correctResponse: [1],
          },
        ],
        value: {
          flavor: Choice.flavors.multiple.value,
          choices: [
            { index: 0, text: 'moo' },
            { index: 1, text: 'bar' },
          ],
        },
      })

      const wrapper = root.firstElementChild
      const inputs = wrapper.querySelectorAll('.choice-interaction')
      const [moo, bar] = inputs

      // show 1 as expected
      expect(bar.classList.contains('item-border-expected')).to.equal(true)
      expect(moo.classList.contains('item-border-expected')).to.equal(false)
      expect(moo.classList.contains('border-light')).to.equal(true)

      // show correct response
      await asyncTimeout(50)
      bar.click()
      await asyncTimeout(150)
      expect(bar.classList.contains('item-border-expected')).to.equal(false)
      expect(bar.classList.contains('border-success')).to.equal(true)
      expect(moo.classList.contains('item-border-expected')).to.equal(false)
      expect(moo.classList.contains('border-light')).to.equal(true)

      // show wrong response
      await asyncTimeout(50)
      moo.click()
      await asyncTimeout(150)
      expect(bar.classList.contains('item-border-expected')).to.equal(false)
      expect(bar.classList.contains('border-success')).to.equal(true)
      expect(moo.classList.contains('border-danger')).to.equal(true)
    })
  })
})
