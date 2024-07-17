import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import './markdownRenderer.css'
import './markdownRenderer.html'

Template.markdownRenderer.onCreated(function () {
  const instance = this
  instance.markdown = new ReactiveVar()

  instance.autorun(async () => {
    const { value } = Template.currentData()

    if (typeof value === 'string') {
      const rendered = await Markdown.renderer(value)
      instance.markdown.set(rendered)
    }
  })
})

Template.markdownRenderer.helpers({
  render () {
    return Template.instance().markdown.get()
  }
})

export const Markdown = {}

Markdown.renderer = async md => md

Markdown.init = (options = {}) => {
  if (options.renderer) {
    Markdown.renderer = options.renderer
  }
}
