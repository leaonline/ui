/* global IntersectionObserver */

import { Random } from 'meteor/random'
import { Template } from 'meteor/templating'
import { ImageUtils } from './ImageUtils'
import './image.html'

Template.image.onCreated(function () {
  const instance = this
  instance.id = Random.id(4)
})

Template.image.helpers({
  attributes() {
    const instance = Template.instance()
    const { id, data } = instance
    return ImageUtils.getAttributes({ data, instanceId: id })
  },
})

Template.image.onRendered(function () {
  const instance = this
  const image = instance.$(`[data-id="${instance.id}"]`).get(0)
  if (!image) {
    return
  }

  const lazyLoad = (image) => {
    image.src = image.getAttribute('data-src')
    image.setAttribute('data-loaded', '1')
    image.removeAttribute('data-src')
  }

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        lazyLoad(entry.target)
        observer.unobserve(entry.target)
      }
    })
  })
  observer.observe(image)
  instance.observer = observer
})

Template.image.onDestroyed(function () {
  const instance = this
  if (instance.observer) {
    try {
      instance.observer.disconnect()
    } catch (e) {
      console.error(e)
    }
  }
})
