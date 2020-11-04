// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from 'meteor/tinytest'

// Import and rename a variable exported by ui.js.
import { name as packageName } from 'meteor/leaonline:ui'

// Write your tests here!
// Here is an example.
Tinytest.add('ui - example', function (test) {
  test.equal(packageName, 'ui')
})
