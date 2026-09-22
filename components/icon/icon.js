import { Template } from 'meteor/templating'
import './icon.html'
import { IconUtils } from './IconUtils'

Template.icon.onCreated(function () {
  const instance = this

  instance.autorun(() => {
    const data = Template.currentData()
    const iconAtts = IconUtils.getAttributes({ data })
    instance.state.set({ iconAtts })
  })
})

Template.icon.helpers({
  iconAtts() {
    return Template.getState('iconAtts')
  },
  spanAtts() {
    const data = Template.instance().data
    return {
      class: data.class,
    }
  },
})
