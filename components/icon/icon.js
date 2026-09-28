import { Template } from 'meteor/templating'
import { IconUtils } from './IconUtils'
import './icon.html'

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
