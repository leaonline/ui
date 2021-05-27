import { Template } from 'meteor/templating'
import './documentRenderer.html'

function replacer (key, value) {
  let val = value

  if (typeof val === 'string') {
    try {
      val = JSON.parse(value)
    } catch (e) {}
  }

  if (typeof val === 'string' && val.includes('\n')) {
    val = val.split(/\n\s*/g)
  }

  return val
}

Template.documentRenderer.helpers({
  parsedDoc () {
    const { doc } = Template.instance().data

    return JSON.stringify(doc, replacer, 2)
  }
})
