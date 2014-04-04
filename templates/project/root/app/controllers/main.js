/*
  Copyright 2013 Northern Arizona University

  This file is part of Sweet Jumps.

  Sweet Jumps is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

  Sweet Jumps is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with Sweet Jumps. If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';
var logger = require('log4js').getLogger('[ctrl] example')

/**
 * Example controller initialization function.
 * @param  {express} app    The global express app. Preferably mount a subapp or router for all of this controller's routes.
 * @param  {object} options Configuration if it exists
 * @param  {[type]} context The instance of the SweetJumps class. Preferably you would not use this unless necessary (to getModule for instance).
 */
module.exports = function (app, options, context) {
  logger.info('Example controller init')

  app.get('/', function (req, res) {
    res.render('main/index', {
      'message': 'Sweet! It works!'
    })
  })
}

