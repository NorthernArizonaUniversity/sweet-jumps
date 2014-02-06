/*
  Copyright 2013 Northern Arizona University

  This file is part of Sweet Jumps.

  Sweet Jumps is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

  Sweet Jumps is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with Sweet Jumps. If not, see <http://www.gnu.org/licenses/>.
*/

var plugin = {
  defaultOptions: {
    path: '/example'
  }
}
module.exports = plugin

plugin.init = function () {
  plugin.logger.info('Example plugin: init()')

  plugin.app.get('/', function (req, res) {
    res.send('Example plugin lives!')
  })

  plugin.app.get('/json', function (req, res) {
    res.json({ message: 'Example plugin lives' })
  })
}