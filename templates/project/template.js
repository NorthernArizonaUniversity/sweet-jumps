/*
  Copyright 2013 Northern Arizona University

  This file is part of Sweet Jumps.

  Sweet Jumps is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

  Sweet Jumps is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with Sweet Jumps. If not, see <http://www.gnu.org/licenses/>.
*/

'use strict'

// Basic template description.
exports.description = 'Creates a new Sweet Jumps template project in the current directory.'

// Template-specific notes to be displayed before question prompts.
exports.notes = ''

// Template-specific notes to be displayed after question prompts.
exports.after = ''

// Any existing file or directory matching this wildcard will cause a warning.
exports.warnOn = '*'

// The actual init template.
exports.template = function(grunt, init, done) {

  init.process({}, [], function(err, props) {
    if (process.env.sj_name) {
      props.name = process.env.sj_name
    } else {
      init.prompts = [init.prompt('name', 'my-project')]
    }

    props.description = process.env.sj_description || ''
    props.version = process.env.sj_version || '0.1.0'
    props.repository = ''
    props.homepage = ''
    props.bugs = ''
    props.node_version = process.env.sj_node_version || '>= 0.8.0'
    props.main = 'server.js'
    props.scripts = {
      "start": "node server.js",
      "test": "grunt mocha:all"
    }
    props.preferGlobal = true

    props.keywords = [];
    props.dependencies = {
      "sweet-jumps": "git+http://github.com/NorthernArizonaUniversity/sweet-jumps.git",
      "underscore": "latest",
      "log4js": "latest",
      "grunt": "latest",
      "grunt-shell-spawn": "latest",
      "grunt-nodemon": "latest"
    }
    props.devDependencies = {
      "mocha": "latest",
      "chai": "latest",
      "zombie": "latest",
      "request": "latest",
      "grunt-contrib-jshint": "latest",
      "grunt-contrib-sass": "latest",
      "grunt-contrib-uglify": "latest",
      "grunt-contrib-watch": "latest"
    }

    props.filename = props.name.toLowerCase().replace(/[^a-z0-9\-]/g, '-')

    // Files to copy (and process).
    var files = init.filesToCopy(props)

    // extract html files and copy those without processing
    // (swig templates uses the same template syntax as grunt-init)
    for (var f in files) {
      if (/\.html$/.test(f) && files.hasOwnProperty(f)) {
        init.copy(f, f, props)
        delete files[f]
      }
    }

    // Only use one server file
    var server = process.env.sj_server || null
    if (server == 'extended' || server == 'hooked' || server == 'simple') {
      delete files['server-extended.js']
      delete files['server-hooked.js']
      delete files['server-simple.js']

      files['server.js'] = 'project/root/server-'+ server +'.js'
    }

    // Actually copy (and process) files.
    init.copyAndProcess(files, props)

    // Generate package.json file.
    props.name = props.filename
    init.writePackageJSON('package.json', props);

    // All done!
    done()
  })

}