/* eslint-env mocha */
import { expect } from 'chai'
import {
  createRendererTestContext,
  renderedText,
} from '../../../../tests/rendererHelpers.tests'
import '../clozeItemRenderer'

const template = 'clozeItemRenderer'

describe('clozeItemRenderer', () => {
  const { render, setup, teardown, sandbox, afterFlush } =
    createRendererTestContext()
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

    for (const [name, text, blanks, selects] of [
      ['a single blank', 'A {{blanks$[cat]}}.', 1, 0],
      ['multiple blanks', '{{blanks$[cat]}} and {{blanks$[dog]}}', 2, 0],
      ['a single select', 'A {{select$[cat|dog]}}.', 0, 1],
      [
        'multiple selects',
        '{{select$[cat|dog]}} and {{select$[red|blue]}}',
        0,
        2,
      ],
      [
        'mixed blanks and selects',
        '{{blanks$[cat]}} and {{select$[red|blue]}}',
        1,
        1,
      ],
    ]) {
      it(`renders text with ${name}`, async () => {
        const root = await render(template, {
          value: { text },
          color: 'info',
          onInput: sandbox.spy(),
        })
        expect(root.querySelectorAll('.cloze-blank')).to.have.length(blanks)
        expect(root.querySelectorAll('.cloze-select')).to.have.length(selects)
        expect(root.querySelector('.alert-danger')).to.equal(null)
        for (const input of root.querySelectorAll('.cloze-item')) {
          expect(input.classList.contains('border-info')).to.equal(true)
          expect(input.getAttribute('data-score')).to.equal('1')
          expect(input.value).to.equal('')
        }
        if (blanks) {
          const input = root.querySelector('.cloze-blank')
          expect(input.size).to.equal(3)
          expect(input.maxLength).to.equal(4)
        }
        if (selects) {
          const select = root.querySelector('.cloze-select')
          expect(
            [...select.options].map((option) => option.value),
          ).to.deep.equal(['', '0', '1'])
          expect(select.getAttribute('aria-label')).to.equal(
            'translated:cloze.selectOption',
          )
        }
      })
    }

    it('renders table rows, skipped cells and optional borders', async () => {
      const root = await render(template, {
        value: {
          text: 'Label || {{blanks$[cat]}}\n<<>> || {{select$[red|blue]}}',
          isTable: true,
          hasTableBorder: false,
        },
        onInput: sandbox.spy(),
      })
      expect(
        root.querySelector('table').classList.contains('table-borderless'),
      ).to.equal(true)
      expect(root.querySelectorAll('tr')).to.have.length(2)
      expect(root.querySelectorAll('td')).to.have.length(4)
      expect(root.querySelectorAll('td')[2].textContent.trim()).to.equal('')
      expect(root.querySelectorAll('.cloze-item')).to.have.length(2)
    })

    it('shows parser errors without rendering an invalid input', async () => {
      const root = await render(template, {
        value: { text: '{{unknown$[cat]}}' },
        onInput: sandbox.spy(),
      })
      expect(root.querySelector('.alert-danger').textContent).to.include(
        'Unexpected flavor - unknown',
      )
      expect(root.querySelector('.cloze-item')).to.equal(null)
    })

    it('restores cached responses and submits changes with omission markers', async () => {
      const onInput = sandbox.spy()
      const onLoad = sandbox
        .stub()
        .returns({ responses: ['cat', '__undefined__'] })
      const data = {
        value: { text: '{{blanks$[cat]}} {{select$[red|blue]}}' },
        contentId: 'cloze-a',
        onLoad,
        onInput,
      }
      const root = await render(template, data)
      const input = root.querySelector('.cloze-input')
      const select = root.querySelector('.cloze-select')
      expect(onLoad.calledOnceWithExactly(data)).to.equal(true)
      expect(input.value).to.equal('cat')
      expect(select.value).to.equal('')

      select.value = '1'
      select.dispatchEvent(new Event('change', { bubbles: true }))
      await afterFlush()
      expect(onInput.lastCall.args).to.deep.equal([
        { ...data, responses: ['cat', '1'] },
      ])

      input.focus()
      input.value = ''
      input.blur()
      await afterFlush()
      expect(onInput.lastCall.args).to.deep.equal([
        { ...data, responses: ['__undefined__', '1'] },
      ])
      const submitted = onInput.callCount
      input.focus()
      input.blur()
      await afterFlush()
      expect(onInput.callCount).to.equal(submitted)
    })

    it('submits empty inputs as omitted when an unanswered blank loses focus', async () => {
      const onInput = sandbox.spy()
      const data = {
        value: { text: '{{blanks$[cat]}} {{select$[red|blue]}}' },
        onInput,
      }
      const root = await render(template, data)
      const input = root.querySelector('.cloze-input')
      input.focus()
      input.blur()
      await afterFlush()
      expect(
        onInput.calledOnceWithExactly({
          ...data,
          responses: ['__undefined__', '__undefined__'],
        }),
      ).to.equal(true)
    })
  })

  describe('scoring feedback', () => {
    for (const [name, text, selector, expected, correctResponse] of [
      ['blank', '{{blanks$[cat]}}', '.cloze-blank', 'cat', /cat/],
      ['select', '{{select$[red|blue]}}', '.cloze-select', 'blue', /1/],
    ]) {
      for (const [status, score, isUndefined] of [
        ['successful', 1, false],
        ['failed', 0, false],
        ['missing', 0, true],
      ]) {
        it(`shows ${status} ${name} feedback`, async () => {
          const root = await render(template, {
            contentId: 'cloze-a',
            value: { text },
            onInput: sandbox.spy(),
            scores: [
              {
                itemId: 'cloze-a',
                target: 0,
                score,
                isUndefined,
                correctResponse,
              },
            ],
          })
          const input = root.querySelector(selector)
          expect(
            input.classList.contains(`border-${score ? 'success' : 'danger'}`),
          ).to.equal(true)
          expect(input.classList.contains('border-2')).to.equal(true)
          const feedback = root.querySelector('.item-border-expected')
          if (score) expect(feedback).to.equal(null)
          else expect(feedback.textContent).to.equal(expected)
        })
      }
    }

    it('matches feedback by both item ID and target and renders explanations', async () => {
      const root = await render(template, {
        contentId: 'cloze-a',
        value: {
          text: '{{blanks$[cat]}} {{blanks$[dog]}}',
          explanation: 'General explanation',
        },
        onInput: sandbox.spy(),
        scores: [
          { itemId: 'other', target: 0, score: 1 },
          {
            itemId: 'cloze-a',
            target: 1,
            score: 0,
            explanation: 'Specific explanation',
          },
        ],
      })
      const [first, second] = root.querySelectorAll('.cloze-blank')
      expect(first.classList.contains('border-2')).to.equal(false)
      expect(second.classList.contains('border-danger')).to.equal(true)
      expect(root.querySelector('.item-border-expected').textContent).to.equal(
        'dog',
      )
      expect(
        renderedText(root.querySelector('.choice-explanation')),
      ).to.include('General explanation')
      expect(
        renderedText(root.querySelector('.choice-explanation')),
      ).to.include('Specific explanation')
    })
  })
})
