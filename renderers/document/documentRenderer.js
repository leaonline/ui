import { Template } from 'meteor/templating'
import { DocumentRendererUtils } from './DocumentRendererUtils'
import './documentRenderer.html'

const replacer = DocumentRendererUtils.replacer()

Template.documentRenderer.helpers({
  parsedDoc() {
    const { doc } = Template.instance().data

    return JSON.stringify(doc, replacer, 2)
  },
})
