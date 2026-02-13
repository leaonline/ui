/* global IntersectionObserver */
import { Template } from 'meteor/templating'
import { Components } from '../Components'
import { Random } from 'meteor/random'
import './image.html'

const imageClass = 'lea-image'

Template.image.onCreated(function () {
  const instance = this
  instance.id = Random.id(4)
})

Template.image.helpers({
  attributes () {
    const instance = Template.instance()
    const { data } = instance
    const customClasses = data.class || ''
    const shadowClass = data.shadow ? 'shadow' : ''
    const classes = `${imageClass} ${shadowClass} ${customClasses}`
    const obj = {}
    const cors = data.cors || data.crossorigin

    if (cors) {
      obj.crossorigin = cors
    }

    Object.keys(data).forEach(key => {
      if (key.includes('data-') || key.includes('aria-')) {
        obj[key] = data[key]
      }
    })

    const base = Components.contentPath()
    const imageSrc = data.src.startsWith('http')
      ? data.src
      : `${base}${data.src}`

    return Object.assign(obj, {
      'data-id': instance.id,
      title: data.title,
      alt: data.alt,
      'aria-title': data.title,
      width: data.width,
      height: data.height,
      class: classes,
      'data-src': imageSrc
    })
  }
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
})
