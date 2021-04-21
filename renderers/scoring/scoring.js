import { Template } from 'meteor/templating'
import { Competency } from 'meteor/leaonline:corelib/contexts/Competency'
import { getCollection } from 'meteor/leaonline:corelib/utils/collection'
import { resolveRepresentative } from 'meteor/leaonline:corelib/utils/resolveRepresentative'
import '../../components/icon/icon'
import './scoring.html'

const toRepresentative = doc => resolveRepresentative(doc, Competency.representative)

Template.itemScoringRenderer.helpers({
  getCompetencies (selector) {
    let competencies = undefined
    const collection = getCollection(Competency.name)
    const query = Array.isArray(selector)
      ? { $in: selector }
      : selector

    competencies = collection.find({ _id: query }).fetch().map(toRepresentative)
    return competencies
  }
})
