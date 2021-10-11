import { Template } from 'meteor/templating'
import './icon.html'

Template.icon.onCreated(function () {
  const instance = this

  instance.autorun(() => {
    const data = Template.currentData()
    const fw = data.fw ? 'fa-fw' : ''
    const pulse = data.pulse ? 'fa-pulse' : ''
    const spinning = data.spin ? 'fa-spin' : ''
    const name = data.name
    const regular = data.far && 'far'
    const solid = data.fas && 'fas'
    const type = regular || solid || 'fas'
    const scale = data.scale ? `fa-${data.scale}x` : ''
    const classAtts = `fa ${type} ${fw} fa-${name} ${pulse} ${spinning} ${scale}`

    instance.state.set('iconAtts', {
      class: classAtts,
      title: data.title,
      'aria-title': data.title
    })
  })
})

Template.icon.helpers({
  iconAtts () {
    return Template.getState('iconAtts')
  },
  spanAtts () {
    const data = Template.instance().data
    return {
      class: data.class
    }
  }
})
