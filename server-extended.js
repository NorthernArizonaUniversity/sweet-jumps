#!/usr/bin/env node

var util = require('util')
  , App = require('./modules/app').App

/**
 * If you need to extensively need to modify application behavior (or just want
 * things to be orderly), extend the base App class and modify whatever you need to.
 * This approach allows you to override methods while still having access to the
 * original method in App.
 *
 * Preferrably, you would put your child class in its own file, but the example is
 * shown here for simplicity.
 *
 * NOTE: If you are hooking events in your constructor, you will probably want to
 * disable auto-start as in server-hooked.js, or the server will start immediately
 * before your hooks are added.
 * Alternately, you can extend EventEmitter -first-, then add hooks, then extend App.
 */

var ExampleApp = function (options) {
  App.call(this, options) // Call the parent contructor.

  // Hook init events here if auto-start is disabled.
  this.on('controllers-loaded', function (controllers) {
    this.logger.warn('I am hooking controller loading and am going to do something awesome.')
    this.logger.dump(controllers)
  }.bind(this))
}
util.inherits(ExampleApp, App)

// Override a core function completely, while retaining the super function
ExampleApp.prototype.initializeModels = function () {
  this.logger.warn('I have overridden model initialization, but not destructively!')
  App.prototype.initializeModels.apply(this)
}


// Then in this file, create a new instance
var app = new ExampleApp({ 'auto-start': false })
app.start()
