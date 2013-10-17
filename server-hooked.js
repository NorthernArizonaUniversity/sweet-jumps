#!/usr/bin/env node

/**
 * If you need to override or hook some of the core behavior but not extensively,
 * create an app instance, disable auto-start, add your event hooks or overrides,
 * and start the app manually.
 */

var SweetJumps = require('./modules/sweet-jumps').SweetJumps
  , app = new SweetJumps({ 'auto-start': false })

// Hook an init event (see README.md for all events)
app.on('controllers-loaded', function (controllers) {
  app.logger.warn('I am hooking controller loading and am going to do something awesome.')
  app.logger.dump(controllers)
})

// Override a core function completely
// (events are preferred, only do this if you really need to, because this is destructive)
SweetJumps.prototype.initializeModels = function () {
  this.logger.warn('I have completely overridden model initialization!')
  this.emit('models-initialized');
}

// Start the app manually
app.start()
