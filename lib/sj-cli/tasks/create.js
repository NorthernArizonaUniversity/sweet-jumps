/*
  Copyright 2013-2014 Northern Arizona University

  This file is part of Sweet Jumps.

  Sweet Jumps is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

  Sweet Jumps is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with Sweet Jumps. If not, see <http://www.gnu.org/licenses/>.
*/

var _ = require('underscore')

module.exports = function (sj) {
  var tasks = {}

  /**
   * Delegates create tasks to subtasks
   * @param  {string} task    Always 'create'
   * @param  {array}  params  CLI Parameters
   * @param  {object} options Yargy argument object
   */
  tasks.create = function (task, params, options) {
    var template = params.shift()

    if (!template || typeof tasks['create_' + template] !== 'function') {
      sj.error('Invalid or missing template.', [
        'create '.green + '<template> '.bold + '[options]'
      ])
    }

    tasks['create_' + template](task, params, options)
  }

  /**
   * Creates a project in the given directory (probably cwd) using a grunt-init template
   * @param  {string} task    Always 'create'
   * @param  {array}  params  CLI Parameters
   * @param  {object} options Yargy argument object
   */
  tasks.create_project = function (task, params, options) {
    /// Planned additions
    //  --view-engine="..."
    //  --no-ember
    //  --no-views   // JSON Rendering
    //  --no-models  // Database not required

    var name = params.shift() || options.name
      , initOpts = []
      , env = { sj_name: name }

    if (!name) {
      sj.error('Project name is required.', [
        'create project '.green + '<name> '.bold + '[options]',
        'create project '.green + '--name=<name> '.bold + '[options]'
      ])
    }

    if (options.server == 'simple' || options.server == 'hooked' || options.server == 'extended') {
      env.sj_server = options.server
    } else if (options['server-simple']) {
      env.sj_server = 'simple'
    } else if (options['server-hooked']) {
      env.sj_server = 'hooked'
    } else if (options['server-extended']) {
      env.sj_server = 'extended'
    }

    if (options.force) {
      initOpts.push('--force')
    }

    sj.gruntInit('project', initOpts, env, function (err, stdout, stderr) {
      if (stdout.length) sj.println(stdout)
      if (stderr.length) sj.println(stderr)

      // TODO: If this option is set, automatically run npm install
      options.install = false

      // Warnings
      if (!env.sj_server || !options.install) {
        sj.println(''.underline + '\nImportant! \n'.yellow)
      }

      if (!options.install) {
        sj.println('Run ' + 'npm install'.green + ' now to install dependencies before generating any more project components or starting the server.\n')
      }

      if (!env.sj_server) {
        sj.println('Before starting development, you will need to choose one of the ' + 'server-*.js'.bold + ' files in the root of your project and rename it to ' + 'server.js'.bold + '.\n')
      }

      // Final message
      sj.println(''.underline + '\nRun ' + 'grunt develop'.green + ' or ' + 'grunt server:dev'.green + ' to get started. See ' + 'README.md'.bold + ' for more available grunt commands.\n')
    })
  }

  /**
   * Creates a model in the project using a grunt-init template
   * @param  {string} task    Always 'create'
   * @param  {array}  params  CLI Parameters
   * @param  {object} options Yargy argument object
   */
  tasks.create_model = function (task, params, options) {
    /// Planned additions
    //  --no-tests

    sj.requireSweetJumpsProject()

    var name = params.shift() || options.name
      , classname = name
          .replace(/(.)([A-Z])/g, '$1-$2')
          .replace(/[a-zA-Z][a-zA-Z1-9]*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          })
          .replace(/[^a-zA-Z1-9]/g, '')
      , env = { sj_name: name }
      , initOpts = []

    if (!name) {
      sj.error('Model name is required.', [
        'create model '.green + '<name> '.bold + '[options]',
        'create model '.green + '--name=<name> '.bold + '[options]'
      ])
    }

    if (name !== classname && !options.force) {
      sj.println('The given model name '.yellow + name.cyan + ' looks non-standard. It has been changed to '.yellow + classname.cyan)

      env.sj_name = classname
    }

    if (options.collection) {
      env.sj_collection = options.collection
    }

    if (options.force) {
      initOpts.push('--force')
    }

    sj.gruntInit('model', initOpts, env)
  }

  /**
   * Creates a controller (router) in the project using a grunt-init template
   * @param  {string} task    Always 'create'
   * @param  {array}  params  CLI Parameters
   * @param  {object} options Yargy argument object
   */
  tasks.create_controller = function (task, params, options) {
    /// Planned additions
    //  --no-views   // JSON Rendering
    //  --no-tests

    sj.requireSweetJumpsProject()

    var name = params.shift() || options.name
      , classname = name
          .replace(/(.)([A-Z])/g, '$1-$2')
          .replace(/\W/g, '-')
          .replace(/[\-\_]+/g, '-')
          .toLowerCase()
      , env = { sj_name: name }
      , initOpts = []
      , template = 'controller'

    if (!name) {
      sj.error('Controller/router name is required.', [
        'create controller '.green + '<name> '.bold + '[options]',
        'create controller '.green + '--name=<name> '.bold + '[options]'
      ])
    }

    if (name !== classname && !options.force) {
      sj.println('The given controller/router name '.yellow + name.cyan + ' looks non-standard. It has been changed to '.yellow + classname.cyan)

      env.sj_name = classname
    }

    if (options.router) {
      template = 'router'
    }

    if (options.force) {
      initOpts.push('--force')
    }

    sj.gruntInit(template, initOpts, env)
  }

  // Alias
  tasks.create_router = function (task, params, options) {
    options.router = true
    tasks.create_controller(tasks, params, options)
  }





  //------------ Help ------------//

  tasks.create.help = {
    description: 'Generates code or creates a new instance of the given template (required).',
    extended: 'Available templates: '
      + _.filter(_.keys(tasks), function (t) {
        return /^create_/.test(t)
      })
      .map(function (t) {
        return t.replace('create_', '').green
      })
      .join(', ')
    ,
    usage: [
      'create '.green + '<template> [options]',
    ]
  }


  tasks.create_project.help = {
    description: 'Creates a new project in the current directory.',
    usage: [
      'create project '.green + '<name> [options]',
      'create project '.green + '--name=<name> [options]'
    ],
    options: {
      name: 'The name of the project.',
      server: '[simple | hooked | extended] (optional)'.grey + ' The type of server.js template to use (by default all 3 will be included).',
      force: 'If there are existing files in the directory, overwrite them.'
    }
  }


  tasks.create_model.help = {
    description: 'Creates a new model in the current project.',
    usage: [
      'create model '.green + '<name> [options]',
      'create model '.green + '--name=<name> [options]'
    ],
    options: {
      name: 'The name of the model (should be in CamelCaps).',
      collection: '(optional)'.grey + ' The name of the MongoDB collection corresponding to your model (defaults to lower-case version of your model name, which is the same as the generated filename).',
      force: 'Model names will not be automatically standardized.'
    }
  }


  tasks.create_controller.help = {
    description: 'Creates a new controller/router and corresponding view in the current project.',
    usage: [
      'create controller '.green + '<name> [options]',
      'create controller '.green + '--name=<name> [options]'
    ],
    options: {
      name: 'The name of the controller/router (should be in usable in a url).',
      router: '(optional)'.grey + ' If included, a SJ router template will be used instead of a simple controller template.',
      force: 'Controller/router names will not be automatically standardized.'
    }
  }


  tasks.create_router.help = {
    description: 'Creates a new router in the current project. Alias of ' + 'create controller'.green + ' but with the router switch always set.',
    usage: [
      'create router '.green + '<name> [options]',
      'create router '.green + '--name=<name> [options]'
    ],
    options: {
      name: 'The name of the router (should be in usable in a url).',
      force: 'Controller/router names will not be automatically standardized.'
    }
  }


  return tasks
}
