import { Template } from 'meteor/templating'
import '../text/text'
import '../soundbutton/soundbutton'
import './textgroup.html'

Template.textGroup.helpers({
  join (...args) {
    args.pop()
    return args.join(' ')
  },
  noAutoText (autoText) {
    return autoText === false
  }
})
