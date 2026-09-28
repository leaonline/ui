import { Competency } from 'meteor/leaonline:corelib/contexts/Competency'
import { addCollection } from 'meteor/leaonline:corelib/utils/collection'
import { Mongo } from 'meteor/mongo'

// Scoring reads the host application's registered competency collection.
// Use real, local Minimongo documents, with no DDP connection or server writes.
export const competencyCollection = new Mongo.Collection(null)
addCollection(competencyCollection, Competency.name)
