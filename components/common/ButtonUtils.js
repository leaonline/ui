export const ButtonUtils = {}

ButtonUtils.leftIcon = ({ icon, iconPos } = {}) => {
  return icon && iconPos !== 'right'
}

ButtonUtils.rightIcon = ({ icon, iconPos } = {}) => {
  return icon && iconPos === 'right'
}
