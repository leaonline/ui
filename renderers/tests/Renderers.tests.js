import { expect } from 'chai'
import { Template } from 'meteor/templating'
import sinon from 'sinon'
import { CoreRenderers } from '../CoreRenderers'
import { Markdown } from '../markdown/markdownRenderer'
import { RendererGroups } from '../RendererGroups'
import { TaskRenderers } from '../Renderers'

describe('TaskRenderers', () => {
  const sandbox = sinon.createSandbox()
  afterEach(() => sandbox.restore())

  it('exposes the default renderers, groups and fallback', () => {
    expect(TaskRenderers.groups).to.equal(RendererGroups)
    expect(TaskRenderers.fallbackRenderer).to.equal('document')
    expect(TaskRenderers.get('missing-renderer')).to.equal(undefined)
    for (const [name, template] of [
      ['factory', 'TaskRendererFactory'],
      ['page', 'taskPageRenderer'],
      ['text', 'textRenderer'],
      ['markdown', 'markdownRenderer'],
      ['image', 'imageRenderer'],
      ['embed', 'embeddedResourceRenderer'],
      ['document', 'documentRenderer'],
    ]) {
      expect(TaskRenderers.get(name)).to.include({ name, template })
      expect(TaskRenderers.get(name).load).to.be.a('function')
    }
  })

  it('returns an independent array and factory descriptor', () => {
    const all = TaskRenderers.all()
    const size = all.length
    all.pop()
    expect(TaskRenderers.all()).to.have.length(size)
    const factory = TaskRenderers.factory()
    expect(factory).to.deep.equal(TaskRenderers.get('factory'))
    factory.template = 'other'
    expect(TaskRenderers.get('factory').template).to.equal(
      'TaskRendererFactory',
    )
  })

  it('registers, groups and replaces custom renderers by name', () => {
    const renderer = {
      name: 'ui-test-custom',
      group: 'ui-test-group',
      template: 'custom',
    }
    const registry = TaskRenderers.registerRenderer(renderer)
    try {
      expect(TaskRenderers.get(renderer.name)).to.equal(renderer)
      expect(TaskRenderers.getGroup(renderer.group)).to.deep.equal([renderer])
      expect(TaskRenderers.getGroup('missing-group')).to.deep.equal([])
      const replacement = { ...renderer, template: 'replacement' }
      TaskRenderers.registerRenderer(replacement)
      expect(TaskRenderers.get(renderer.name)).to.equal(replacement)
      expect(
        TaskRenderers.all().filter(({ name }) => name === renderer.name),
      ).to.have.length(1)
    } finally {
      registry.delete(renderer.name)
    }
  })

  for (const [name, type, subtype, width] of [
    ['text', 'text', 'text', '12'],
    ['markdown', 'text', 'markdown', '12'],
    ['image', 'media', 'image', 'col-12'],
    ['embed', 'media', 'embed', 'col-12'],
  ]) {
    it(`preserves the ${name} schema and translated width options`, () => {
      const imageForm = { type: 'image-picker' }
      const schema = TaskRenderers.get(name).schema({
        i18n: (key) => `translated:${key}`,
        imageForm,
      })
      expect(schema.type).to.include({ type: String, defaultValue: type })
      expect(schema.type.autoform.type).to.equal('hidden')
      expect(schema.subtype).to.include({ type: String, defaultValue: subtype })
      expect(schema.subtype.autoform.type).to.equal('hidden')
      expect(schema.value.type).to.equal(String)
      expect(schema.width).to.include({ type: String, defaultValue: width })
      expect(schema.width.autoform.firstOption).to.equal(false)
      expect(schema.width.autoform.options()).to.deep.equal(
        ['12', '8', '6', '4', '2'].map((value) => ({
          value,
          label: `translated:grid.${value}`,
        })),
      )
      if (name === 'image') expect(schema.value.autoform).to.equal(imageForm)
      else expect(schema.value.autoform.type).to.equal('textarea')
    })
  }

  it('provides the text and markdown presentation options', () => {
    const options = { i18n: (key) => key }
    const text = TaskRenderers.get('text').schema(options)
    expect(text.value.autoform.rows).to.equal(4)
    expect(text.hidden).to.deep.equal({
      type: Boolean,
      defaultValue: false,
      optional: true,
    })
    const markdown = TaskRenderers.get('markdown').schema(options)
    expect(markdown.useTTS).to.include({
      type: Boolean,
      optional: true,
      defaultValue: false,
    })
    for (const name of ['padding', 'lineHeight']) {
      expect(markdown[name]).to.deep.equal({
        type: Number,
        optional: true,
        defaultValue: 0,
        min: 0,
        max: 5,
      })
    }
    for (const name of ['background', 'textColor']) {
      expect(markdown[name].autoform.options()).to.deep.equal([
        { value: 'light', label: 'colors.light' },
        { value: 'dark', label: 'colors.dark' },
      ])
    }
    expect(
      TaskRenderers.get('embed').schema(options).value.autoform.rows,
    ).to.equal(8)
  })

  it('initializes once, loads the shell renderers and assigns options to core renderers', async () => {
    const factory = sandbox
      .stub(TaskRenderers.get('factory'), 'load')
      .resolves()
    const page = sandbox.stub(TaskRenderers.get('page'), 'load').resolves()
    const options = {
      text: { example: true },
      [CoreRenderers.get()[0].name]: { coreOption: true },
    }
    const configured = Object.keys(options).map(
      (name) =>
        TaskRenderers.get(name) ||
        CoreRenderers.get().find((renderer) => renderer.name === name),
    )
    const previous = configured.map((renderer) =>
      Object.getOwnPropertyDescriptor(renderer, '__initOptions'),
    )
    try {
      expect(await TaskRenderers.init(options)).to.equal(true)
      expect(factory.calledOnce).to.equal(true)
      expect(page.calledOnce).to.equal(true)
      expect(factory.calledBefore(page)).to.equal(true)
      for (const renderer of CoreRenderers.get())
        expect(TaskRenderers.get(renderer.name)).to.equal(renderer)
      for (const renderer of configured)
        expect(renderer.__initOptions).to.equal(options[renderer.name])
      expect(
        await TaskRenderers.init({ text: { replacement: true } }),
      ).to.equal(true)
      expect(factory.calledOnce).to.equal(true)
      expect(page.calledOnce).to.equal(true)
      expect(TaskRenderers.get('text').__initOptions).to.equal(options.text)
    } finally {
      configured.forEach((renderer, index) => {
        if (previous[index])
          Object.defineProperty(renderer, '__initOptions', previous[index])
        else delete renderer.__initOptions
      })
    }
  })

  it('loads the layout and document templates and forwards markdown initialization', async () => {
    const init = sandbox.stub(Markdown, 'init')
    const options = { renderer: async () => '<p>markdown</p>' }
    for (const name of [
      'factory',
      'page',
      'text',
      'image',
      'embed',
      'document',
      'markdown',
    ]) {
      const renderer = TaskRenderers.get(name)
      await renderer.load(name === 'markdown' ? options : undefined)
      expect(Template[renderer.template]).to.be.an.instanceOf(Template)
    }
    expect(init.calledOnceWithExactly(options)).to.equal(true)
    expect(
      TaskRenderers.getGroup(RendererGroups.layout.name).map(
        ({ name }) => name,
      ),
    ).to.deep.equal(['text', 'markdown', 'image', 'embed'])
  })
})
