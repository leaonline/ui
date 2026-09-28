import { Competency } from 'meteor/leaonline:corelib/contexts/Competency'
import { getCollection } from 'meteor/leaonline:corelib/utils/collection'
import { resolveRepresentative } from 'meteor/leaonline:corelib/utils/resolveRepresentative'

export const ScoringRendererUtils = {}

ScoringRendererUtils.getCompetencies = (selector) => {
  const collection = getCollection(Competency.name)
  const query = Array.isArray(selector) ? { $in: selector } : selector
  return collection.find({ _id: query }).fetch().map(toRepresentative)
}

const toRepresentative = (doc) =>
  resolveRepresentative(doc, Competency.representative)
