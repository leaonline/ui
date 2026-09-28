import { Template } from 'meteor/templating'
import './h5pRenderer.html'

// TODO: get from config
const h5pRenderUrl = 'https://example.com'

Template.h5pRenderer.helpers({
  contentUrl() {
    const data = Template.instance().data
    return (
      data.value &&
      `${h5pRenderUrl}${data.value}&userId=${data.userId}&sessionId=${data.sessionId}&taskId=${data.taskId}&page=${data.page}`
    )
  },
})
