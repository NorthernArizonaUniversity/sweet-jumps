/*
  Copyright 2013 Northern Arizona University

  This file is part of Sweet Jumps.

  Sweet Jumps is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

  Sweet Jumps is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with Sweet Jumps. If not, see <http://www.gnu.org/licenses/>.
*/

// To get a logger instance, use the following (preferred)
var logger = require('log4js').getLogger('[mdlwr] example')
// Or use the getLogger statement on line 13 (inside the controller init)

/**
 * Example middleware initialization function.
 * @param  {express} app    The global express app.
 * @param  {object} options Configuration if it exists
 * @param  {[type]} context The instance of the SweetJumps class. Preferably you would not use this unless necessary (to getModule for instance).
 */
module.exports = function (app, options, context) {
  'use strict';
  //var logger = context.getLogger('[ctrl] example')
  logger.info('Example middleware init')

  app.use(function (req, res, next) {
    logger.info('Example middleware reporting in...')
    next()
  });
}