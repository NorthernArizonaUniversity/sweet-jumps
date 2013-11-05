#!/usr/bin/env node

/*
  Copyright 2013 Northern Arizona University

  This file is part of Sweet Jumps.

  Sweet Jumps is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

  Sweet Jumps is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with Sweet Jumps. If not, see <http://www.gnu.org/licenses/>.
*/

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
