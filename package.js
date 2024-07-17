/* eslint-env meteor */
Package.describe({
  name: 'leaonline:ui',
  version: '2.0.0',
  // Brief, one-line summary of the package.
  summary: 'Common Blaze ui-components for .lea apps',
  // URL to the Git repository containing the source code for this package.
  git: 'git@github.com:leaonline/ui.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
})

Package.onUse(function (api) {
  api.versionsFrom(['3.0.1'])

  api.use([
    'ecmascript',
    'templating',
    'reactive-dict',
    'dynamic-import',
    'leaonline:corelib'
  ])
})

Package.onTest(function (api) {
  api.versionsFrom(['3.0.1'])
  api.use('ecmascript')
  api.use('random')
  api.use([
    //'lmieulet:meteor-legacy-coverage',
    //'lmieulet:meteor-coverage',
    'meteortesting:mocha@3.0.0-rc.1'
  ])
  api.use('leaonline:corelib@2.0.0')
  api.use('leaonline:ui@2.0.0')
  api.mainModule('ui-tests.js', ['server', 'client'])
})
