/* eslint-env meteor */
Package.describe({
  name: 'leaonline:ui',
  version: '2.1.1',
  // Brief, one-line summary of the package.
  summary: 'Common Blaze ui-components for .lea apps',
  // URL to the Git repository containing the source code for this package.
  git: 'git@github.com:leaonline/ui.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
})

Package.onUse(function (api) {
  api.versionsFrom(['3.0.1', '3.4'])

  api.use([
    'ecmascript',
    'templating@1.4.4',
    'reactive-dict',
    'dynamic-import',
    'leaonline:corelib'
  ])
})

Package.onTest(function (api) {
  api.versionsFrom(['3.0.1', '3.4'])
  api.use('ecmascript')
  api.use('random')
  api.use([
    'templating@1.4.4',
    'jquery@3.0.0',
    'lmieulet:meteor-legacy-coverage@0.4.0',
    'lmieulet:meteor-coverage@5.0.0',
    'meteortesting:mocha@3.3.0'
  ])
  api.use('leaonline:corelib@2.0.0')
  api.use('leaonline:ui@2.1.0')
  api.mainModule('ui-tests.js', ['server', 'client'])
})
