export const dataTarget = (
  event,
  templateInstance,
  dataAttribute = 'target',
) => {
  if (typeof templateInstance === 'string') {
    dataAttribute = templateInstance
    return event.currentTarget.dataset[dataAttribute]
  }
  templateInstance.$(event.currentTarget).data(dataAttribute)
}
