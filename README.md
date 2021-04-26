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

- Factory - A factory to initialize a renderer by given name with given data
- Text - renders plain text
- Image - renders a lazy-loaded image
- Item - render specific item types
- Markdown - renders markdown
- Page - renders a page with mixed and variable content

## Run tests

We use a proxy project for testing. Please follow the steps for setup and run:

```bash
$ cd test-proxy
$ meteor npm install
$ meteor npm run setup
$ meteor npm run test:watch
```
