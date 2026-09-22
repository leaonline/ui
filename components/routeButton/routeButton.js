import { Template } from 'meteor/templating'

import '../soundbutton/soundbutton'
import './routeButton.html'
import { ButtonUtils } from '../common/ButtonUtils'
import { RouteButtonUtils } from './RouteButtonUtils'

Template.routeButton.helpers({
  sound() {
    const instance = Template.instance()
    return instance.data.sound !== false
  },
  leftIcon() {
    const instance = Template.instance()
    const { data } = instance
    return data.icon && data.iconPos !== 'right'
  },
  rightIcon() {
    const instance = Template.instance()
    return ButtonUtils.rightIcon(instance.data)
  },
  attributes() {
    const instance = Template.instance()
    return RouteButtonUtils.getAttributes(instance)
  },
  groupAttributes() {
    const instance = Template.instance()
    return RouteButtonUtils.getGroupAttributes(instance)
  },
})
