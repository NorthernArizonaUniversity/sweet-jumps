/*
  Copyright 2013 Northern Arizona University

  This file is part of Sweet Jumps.

  Sweet Jumps is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

  Sweet Jumps is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with Sweet Jumps. If not, see <http://www.gnu.org/licenses/>.
*/

'use strict'

// Basic template description.
exports.description = 'Creates a new application controller and index view.'

// Template-specific notes to be displayed before question prompts.
exports.notes = ''

// Template-specific notes to be displayed after question prompts.
exports.after = ''

// Any existing file or directory matching this wildcard will cause a warning.
//exports.warnOn = '*'

// The actual init template.
exports.template = function(grunt, init, done) {

  init.process({}, [
    // Prompt for these values.
    {
      name: 'name',
      message: 'Route name (eg. "my-route" maps to "http://example.com/my-route")',
      default: null,
      validator: /^[\w+\-]+$/,
      warning: 'Route names should be lowercase with words separated by hyphens or underscores.'
    }
  ], function(err, props) {
    props.name = props.name.toLowerCase()
    props.filename = props.name.replace(/\_/g, '-')

    // Files to copy (and process).
    var files = init.filesToCopy(props)

    // Actually copy (and process) files.
    init.copyAndProcess(files, props)

    // All done!
    done()
  })

}