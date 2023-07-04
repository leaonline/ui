# Leaonline UI Components

This package brings common UI components to the Blaze ecosystem that are 
required in many of the lea.online applications.

#### Components (Templates)

- Soundbutton - A button with an associated tts-id, resolved by the TTSClient to play the associated sound
- Text - Renders a basic Text plus the associated sound button
- Image - lazy loads an image by given source
- Video - lazy loads / streams a video by given source
- Icon - wrapper for icon frameworks (currently using font-awesome 5)
- ActionButton - A button with a certain action and an integrated SoundButton

#### Renderers (Templates)

All lea.online applications resolve around certain interactions, mostly them being part of several units.
In order to dynamically display (and edit) these interactions, we use a set of dynamic renderers:

| Name     | key        | Description                                                                                       |
|----------|------------|---------------------------------------------------------------------------------------------------|
| Factory  | `factory`  | A Blaze factory template to dynamically load and execute a renderer by given name with given data |
| Page     | `page`     | renders a page with mixed and variable content                                                    
| Text     | `text`     | renders plain text                                                                                |
| Image    | `image`    | renders a lazy-loaded image                                                                       |
| Item     | `item`     | render-factory for specific item types                                                            |
| Markdown | `markdown` | renders markdown, requires a custom renderer function that uses the host app's markdown parser| 

**Init task renderers**

Initializing renderer allows to pass options by using their key
and pass options as Object:

```js
import { TaskRenderers } from '../../renderers/TaskRenderers'

TaskRenderers.init({
  markdown: {
    renderer: async txt => {
      const mdOptions = { input: txt, renderer: defaultMarkdownRendererName }
      return LeaMarkdown.parse(mdOptions)
    }
  }
})
  .catch(console.error)
  .then(() => { /* core renderers loaded */ })
```

## Run tests

We use a proxy project for testing. Please follow the steps for setup and run:

```bash
$ cd test-proxy
$ meteor npm install
$ meteor npm run setup
$ meteor npm run test:watch
```
