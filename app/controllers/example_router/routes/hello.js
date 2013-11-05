/*
  Copyright 2013 Northern Arizona University

  This file is part of Sweet Jumps.

  Sweet Jumps is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

  Sweet Jumps is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with Sweet Jumps. If not, see <http://www.gnu.org/licenses/>.
*/

logger = require('log4js').getLogger('[ctrl] router/hello')

/**
 * /hello Handler
 */
module.exports = function (app, options, context) {
  logger.info('Initializing /example_router/hello routes')

  app.all('/', function (req, res, next) {
    logger.info('Request /hello')
    res.render('index')
  })

}
