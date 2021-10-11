import { Template } from 'meteor/templating'
import '../../../components/image/image'
import '../../../components/soundbutton/soundbutton'
import './connectItemRenderer.css'
import './connectItemRenderer.html'

var dragged;

Template.connectItemRenderer.onCreated(function () {
  const instance = this
})

Template.connectItemRenderer.events({
  'drag' (event, templateInstance) {
    // console.log('drag')
  },
  'dragstart .connect-draggable' (event, templateInstance) {
    console.log('dragstart')
    event.originalEvent.dataTransfer.setData('text/plain', null)
    dragged = event.target;
  },
  'dragend .connect-draggable' (event, templateInstance) {
    console.log('dragend')
  },
  'dragover' (event, templateInstance) {
    // console.log('dragover')
    event.preventDefault();
  },
  'dragenter .connect-dropzone' (event, templateInstance) {
    console.log('drag enter')
    event.preventDefault();
    templateInstance.$(event.target).removeClass('bg-light')
    templateInstance.$(event.target).addClass('bg-secondary')
  },
  'dragleave .connect-dropzone' (event, templateInstance) {
    console.log('drag leave')
    templateInstance.$(event.target).removeClass('bg-secondary')
    templateInstance.$(event.target).addClass('bg-light')
  },
  'drop' (event, templateInstance) {
    console.log('drop', event)
    event.preventDefault();

    if ( event.target.className == "dropzone" ) {
      event.target.style.background = "";
      dragged.parentNode.removeChild( dragged );
      event.target.appendChild( dragged );
    }
  }
})
