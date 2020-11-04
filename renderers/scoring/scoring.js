import { Template } from 'meteor/templating'
import { Competency } from 'meteor/leaonline:corelib/contexts/Competency'
import { getCollection } from 'meteor/leaonline:corelib/utils/collection'
import { resolveRepresentative } from 'meteor/leaonline:corelib/utils/resolveRepresentative'
import '../../components/icon/icon'
import './scoring.html'

Template.itemScoringRenderer.helpers({
  getCompetency (_id) {
    const competencyDoc = getCollection(Competency.name).findOne(_id) || {}
    return resolveRepresentative(competencyDoc, Competency.representative)
  }
})
