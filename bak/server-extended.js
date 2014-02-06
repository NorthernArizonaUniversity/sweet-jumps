#!/usr/bin/env node

/*
  Copyright 2013 Northern Arizona University

  This file is part of Sweet Jumps.

  Sweet Jumps is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

  Sweet Jumps is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with Sweet Jumps. If not, see <http://www.gnu.org/licenses/>.
*/

var util = require('util')
  , SweetJumps = require('./modules/sweet-jumps').SweetJumps

/**
 * If you need to extensively need to modify application behavior (or just want
 * things to be orderly), extend the base SweetJumps class and modify whatever you need to.
 * This approach allows you to override methods while still having access to the
 * original method in SweetJumps.
 *
 * Preferrably, you would put your child class in its own file, but the example is
 * shown here for simplicity.
 *
 * NOTE: If you are hooking events in your constructor, you will probably want to
 * disable auto-start as in server-hooked.js, or the server will start immediately
 * before your hooks are added.
 * Alternately, you can extend EventEmitter -first-, then add hooks, then extend SweetJumps.
 */

var ExampleApp = function (options) {
  SweetJumps.call(this, options) // Call the parent contructor.

  // Hook init events here if auto-start is disabled.
  this.on('controllers-loaded', function (controllers) {
    this.logger.warn('I am hooking controller loading and am going to do something awesome.')
    this.logger.dump(controllers)
  }.bind(this))
}
util.inherits(ExampleApp, SweetJumps)

// Override a core function completely, while retaining the super function
ExampleApp.prototype.initializeModels = function () {
  this.logger.warn('I have overridden model initialization, but not destructively!')
  SweetJumps.prototype.initializeModels.apply(this)
}


// Then in this file, create a new instance
var app = new ExampleApp({ 'auto-start': false })
app.start()
