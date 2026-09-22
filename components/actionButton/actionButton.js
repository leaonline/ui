import { Template } from 'meteor/templating'
import { ButtonUtils } from '../common/ButtonUtils'
import { ActionButtonUtils } from './ActionButtonUtils'
import '../soundbutton/soundbutton'
import './actionButton.html'

Template.actionButton.helpers({
  soundButtonAtts() {
    const instance = Template.instance()
    return ActionButtonUtils.getSoundButtonAttributes(instance)
  },
  leftIcon() {
    const instance = Template.instance()
    return ButtonUtils.leftIcon(instance.data)
  },
  rightIcon() {
    const instance = Template.instance()
    return ButtonUtils.rightIcon(instance.data)
  },
  iconClass(base) {
    const instance = Template.instance()
    const { data } = instance
    return ActionButtonUtils.iconClass({ data, base })
  },
  attributes() {
    const instance = Template.instance()
    return ActionButtonUtils.getAttributes(instance)
  },
  groupAttributes() {
    const instance = Template.instance()
    return ActionButtonUtils.getGroupAttributes(instance)
  },
})
