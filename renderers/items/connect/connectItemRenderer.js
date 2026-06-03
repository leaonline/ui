import { Template } from 'meteor/templating'
import { dataTarget } from '../../../utils/eventUtils'
import { createSubmitResponses } from '../utils/createSubmitResponses'
import { getExplanations } from '../utils/getExplanations'
import '../explanation/itemExplanations'
import '../../../components/image/image'
import '../../../components/soundbutton/soundbutton'
import './connectItemRenderer.css'
import './connectItemRenderer.html'

Template.connectItemRenderer.onCreated(function () {
  const instance = this
  instance.dragged = null
  instance.state.setDefault({
    target: null,
    hover: null,
    connections: null,
    dragging: false,
    dragOver: null,
    readOnly: null
  })

  instance.state.setDefault('responseCache', null)
  instance.state.setDefault('readOnly', false)
  instance.submitResponse = createSubmitResponses({
    onInput: instance.data.onInput,
    responseCache: {
      get: () => instance.state.get('responseCache'),
      set: val => instance.state.set('responseCache', val)
    }
  })

  instance.getResponse = () => {
    const connections = instance.state.get('connections') ?? []
    return connections.map(c => `${c.from},${c.to}`)
  }

  instance.createLine = ({ from, to, source, target, color }) => {
    // get the root position
    const root = document.querySelector('.connect-root')
    const rootRect = root.getBoundingClientRect()

    const rx = rootRect.x
    const ry = rootRect.y

    // get the source position
    const x1 = (source.left - rx) + source.width + 10
    const y1 = (source.top - ry) + source.height / 2

    // get the dropzone position
    const x2 = (target.left - rx)
    const y2 = (target.top - ry) + target.height / 2

    // center remove button on the middle of the line
    const cx = (x1 + x2) / 2
    const cy = ((y1 + y2) / 2) - 10

    // measure width and height of the svg container
    const width = rootRect.width
    const height = rootRect.height

    return { from, to, x1, y1, x2, y2, cx, cy, color, width, height }
  }

  // autorun to initialize connections from response
  instance.autorun(function () {
    const data = Template.currentData()
    const { value, color, readOnly, scores } = data
    if (scores) {
      const connections = instance.state.get('connections') ?? []
      const explanations = getExplanations({ value, scores })

      // step 1 - check status of made connections
      connections.forEach((connection) => {
        if (connection.validated) { return }
        const { from, to } = connection
        const valid = scores.some(({ correctResponse }) => {
          if (typeof correctResponse[0] === 'object') {
            return correctResponse.some(({ left, right }) => left == from && right == to)
          }
          else {
            console.warn('Unexpected correctResponse format', correctResponse)
          }

        })
        connection.validated = true
        connection.color = valid ? `var(--bs-success)` : 'var(--bs-danger)'
      })

      // step 2 - add potentially missed connections

      scores.forEach(({ correctResponse }) => {
        if (correctResponse.length < 2) { return }
        const evaluate = (left, right) => {
          const hasConnection = connections.find(c => c.from == left && c.to == right)

          // if it does not have a connection, then we get the elements by their index
          // and calculate the line coordinates
          if (!hasConnection) {
            const source = document.querySelector(`.connect-draggable[data-index="${left}"]`)
            const target = document.querySelector(`.connect-dropzone[data-index="${right}"]`)

            if (source && target) {
              const line = instance.createLine({
                from: left,
                to: right,
                source: source.getBoundingClientRect(),
                target: target.getBoundingClientRect(),
                color: `var(--bs-secondary)`
              })
              line.validated = true
              connections.push(line)
            }
          }
        }
        if (typeof correctResponse[0] === 'object') {
          correctResponse.forEach(({ left, right }) => {
            evaluate(left, right)
          })
        }
        else {
          console.warn('Unexpected correctResponse format', correctResponse)
        }
      })

      instance.state.set({ connections, explanations })
    } else {
      instance.state.set({ explanations: null })
    }
    instance.state.set({ color, readOnly })
  })
})

Template.connectItemRenderer.onRendered(function () {
  const instance = this

  instance.autorun(() => {
    const data = Template.currentData()

    // if we have any values cached we need to restore them here, because
    // the choices need to be drawn first, in order to access them
    if (typeof data.onLoad === 'function') {
      const cachedData = data.onLoad(data) ?? {}

      if (cachedData) {
        const connections = Tracker.nonreactive(() => instance.state.get('connections') ?? [])
        const { responses = [] } = cachedData
        responses.forEach(response => {
          const [from, to] = response.split(',')
          const source = document.querySelector(`.connect-draggable[data-index="${from}"]`)
          const target = document.querySelector(`.connect-dropzone[data-index="${to}"]`)

          if (source && target) {
            const line = instance.createLine({
              from,
              to,
              source: source.getBoundingClientRect(),
              target: target.getBoundingClientRect(),
              color: `var(--bs-${data.color})`
            })
            connections.push(line)
          }
          instance.state.set({ connections })
        })
      }
    }
  })
})

Template.connectItemRenderer.onDestroyed(function () {
  const instance = this
  instance.dragged = null
  instance.submitResponse({
    responses: instance.getResponse(),
    data: instance.data
  })
  instance.state.clear()
})

Template.connectItemRenderer.helpers({
  hover (side, index) {
    const data = Template.getState('hover') ?? {}
    return data.side === side && data.index == index
  },
  color () {
    return Template.currentData().color
  },
  dragging () {
    return Template.getState('dragging')
  },
  dragOver (index) {
    const data = Template.getState('dragOver') ?? {}
    return data.index == index
  },
  connections () {
    return Template.getState('connections')
  },
  explanations () {
    return Template.instance().state.get('explanations')
  }
})

Template.connectItemRenderer.events({
  'mouseenter .connect-draggable' (event, templateInstance) {
    const side = dataTarget(event, 'side')
    const index = dataTarget(event, 'index')
    templateInstance.state.set('hover', { side, index })
  },
  'mouseleave .connect-draggable' (event, templateInstance) {
    templateInstance.state.set('hover', null)
  },
  'drag' (event, templateInstance) {
    // console.log('drag')
  },
  'dragstart .connect-draggable' (event, templateInstance) {
    event.originalEvent.dataTransfer.setData('text/plain', null)
    templateInstance.dragged = event.target
    templateInstance.state.set('dragging', true)
  },
  'dragend .connect-draggable' (event, templateInstance) {
    templateInstance.state.set('dragging', false)
  },
  'dragover' (event, templateInstance) {
    event.preventDefault()
  },
  'dragenter .connect-dropzone' (event, templateInstance) {
    event.preventDefault()
    if (event.currentTarget.className.includes('dropzone')) {
      const index = dataTarget(event, 'index')
      templateInstance.state.set('dragOver', { index })
    }
  },
  'dragleave .connect-dropzone' (event, templateInstance) {
    if (event.currentTarget.className.includes('dropzone')) {
      templateInstance.state.set('dragOver', null)
    }
  },
  'drop' (event, templateInstance) {
    event.preventDefault()

    // add a new line
    if (event.target.className.includes('dropzone')) {
      const dropIndex = dataTarget(event, 'index')
      const childIndex = templateInstance.dragged.dataset.index
      const connections = templateInstance.state.get('connections') ?? []
      const existing = connections.find(c => c.from == childIndex && c.to == dropIndex)
      if (existing) { return }

      // get the draggable position
      const source = templateInstance.dragged.getBoundingClientRect()

      // get the dropzone position
      const target = event.target.getBoundingClientRect()

      const child = templateInstance.createLine({
        from: childIndex,
        to: dropIndex,
        source,
        target,
        color: `var(--bs-${Template.currentData().color})`
      })
      connections.push(child)

      templateInstance.state.set({ connections, dragging: false, dragOver: null })

      // submit response
      templateInstance.submitResponse({
        responses: templateInstance.getResponse(),
        data: templateInstance.data
      })
    }
  },
  'click .connect-remove-btn' (event, templateInstance) {
    event.preventDefault()
    const from = dataTarget(event, 'from')
    const to = dataTarget(event, 'to')
    const connections = templateInstance.state.get('connections') ?? []
    const newConnections = connections.filter(c => !(c.from == from && c.to == to))
    templateInstance.state.set('connections', newConnections)
  }
})
