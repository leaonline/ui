import { Template } from 'meteor/templating'
import {ScoringRendererUtils} from "./ScoringRendererUtils";
import '../../components/icon/icon'
import './scoring.html'

Template.itemScoringRenderer.helpers({
  getCompetencies(selector) {
      return ScoringRendererUtils.getCompetencies(selector)
  },
})
