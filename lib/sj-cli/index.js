/*
  Copyright 2013-2014 Northern Arizona University

  This file is part of Sweet Jumps.

  Sweet Jumps is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

  Sweet Jumps is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with Sweet Jumps. If not, see <http://www.gnu.org/licenses/>.
*/

var fs = require('fs')
  , path = require('path')
  , colors = require('colors')
  , promptly = require('promptly')
  , _ = require('underscore')
  , common = require('../sweet-jumps/common')
  , tasks = {}
  , paths = {
      base: path.resolve(__dirname, '..', '..'),
      bin:  path.resolve(__dirname, '..', '..', 'node_modules', '.bin'),
      lib:  path.resolve(__dirname, '..', '..', 'lib'),
      tmpl: path.resolve(__dirname, '..', '..', 'templates'),
      cwd:  process.cwd(),
    }
  , sj = {}
  , print = function (s) { process.stdout.write(s || '') }
  , println = function (s) { print((s || '') + '\n') }
  , ln = '\n'
  , argv = require('yargs')
    .alias('v', 'verbose')
    .argv

// returns the absolute path to node binaries or init templates respectively
paths.getBinary = function (name) { return path.resolve(paths.bin, name) }
paths.getTemplate = function (name) { return path.resolve(paths.tmpl, name) }

// externalize some stuff
sj.scriptname = argv.$0 || 'sj'
sj.paths = paths
sj.print = print
sj.println = println
sj.argv = argv

/**
 * Returns the task given by name and optional subtask or null
 * @param  {string} task          The name of the task to get
 * @param  {string|null} subtask  (optional) Subtask
 * @return {function}             The executable task function.
 */
sj.getTask = function (task, subtask) {
  if (Array.isArray(task)) {
    subtask = task.slice(1, 2).shift()
    task = task.shift()
  }

  if (task && typeof tasks[task + '_' + subtask] === 'function') {
    return tasks[task + '_' + subtask]
  } else if (task && typeof tasks[task] === 'function') {
    return tasks[task]
  }

  return null
}

/**
 * Returns an array of strings containing available task names.
 * @return {array|null} Array of string names
 */
sj.getTaskNames = function (task) {
  return Object.keys(tasks).sort()
}

/**
 * Returns an array of strings containing available subtask names for the given task.
 * @param  {string} task  The name of the task to get
 * @return {array|null}   Array of string names
 */
sj.getSubtaskNames = function (task) {
  if (sj.getTask(task)) {
    var re = new RegExp('^' + task + '(_|$)')
    return _.filter(Object.keys(tasks), function (task) { return re.test(task) } ).sort()
  }
  return null
}

/**
 * Shows the given error and quits the program, optionally showing the given usage.
 * @param  {string} error
 * @param  {array|string|null} usage
 */
sj.error = function (error, usage) {
  println(('Something went wrong! '.bold + error).yellow + ln)
  sj.printUsage(usage)
  process.exit()
}

/**
 * Prints usage information from an array of possible choices
 * @param  {array|string} usage
 */
sj.printUsage = function (usage) {
  if (usage) {
    println("Usage:")

    if (!Array.isArray(usage)) { usage = [usage] }

    _.each(usage, function (line, i) {
      var prefix = ''
      if (usage.length > 1) {
        prefix = i ? 'or ' : '   '
      }
      println('    ' + prefix.grey + sj.scriptname.green + ' ' + line)
    })

    println()
  }
}

/**
 * Prints options information
 * @param  {object} options Option names in keys and diescriptions in values
 */
sj.printOptions = function (options) {
  if (options && Array.isArray(Object.keys(options))) {
    println("Options:")

    _.each(options, function (value, key) {
      println('    ' + key.cyan + ' - ' + value)
    })

    println()
  }
}

/**
 * Determines if the given directory is likely a Sweet Jumps project root.
 * @param  {string} dir Directory to test
 * @return {bool}     True if directory looks like a project root
 */
sj.isSweetJumpsProject = function (dir) {
  // This is probably a Sweet Jumps project in the cwd if the SJ library
  // is in node_modules, and there are app and config directories.
  return fs.existsSync(path.resolve(dir, 'node_modules', 'sweet-jumps'))
    && fs.existsSync(path.resolve(dir, 'app'))
    && fs.existsSync(path.resolve(dir, 'config'))

  // TODO: Maybe change to a get and bubble up to parent directories?
}

/**
 * Error and quit if the current working directory is not a Sweet Jumps folder.
 */
sj.requireSweetJumpsProject = function () {
  if (!sj.isSweetJumpsProject(paths.cwd)) {
    sj.error('This task requires a Sweet Jumps project directory.')
  }
}

/**
 * Runs grunt init with the specified template
 * @param  {string}       template The template directory to init
 * @param  {array|null}   options  (optional) Array of options to append to the command
 * @param  {object|null}  env      (optional) Environment variables for the command
 * @param  {function}     callback (optional) Is passed output from the command (err, stdout, stderr)
 */
sj.gruntInit = function (template, options, env, callback) {
  if (typeof options === 'function') {
    callback = options
    options = []
    env = {}
  }

  if (typeof env === 'function') {
    callback = env
    if (typeof options === 'string' || Array.isArray(options)) {
      env = {}
    } else {
      env = options
      options = []
    }
  }

  options = [ paths.getTemplate(template) ].concat(options)

  common.exec(paths.getBinary('grunt-init'), options, env, function (err, stdout, stderr) {
    // Clean up some of the output
    stdout = stdout
      .replace(/Running \"init\:[^\n]*\n/g, '')
      .replace(/This task will create[^\n]*\n/g, '')
      .replace(/environment and the answers[^\n]*\n/g, '')
      .replace(/question will show question\-specific[^\n]*\n/g, '')
      .replace(/will leave its value blank\.[^\n]*\n/g, '')
      .replace(/Please answer the following\:[^\n]*\n/g, '')
      .replace(/\n\n+/g, "\n\n")

    if (typeof callback === 'function') {
      callback(err, stdout, stderr)
    } else {
      if (stdout.length) {
        println(stdout)
      }
      if (stderr.length) {
        println(stderr)
      }
   }
  })
}


sj._decoratePrompt = function (message, choices, opts) {
  var def = opts.default || null

  if (choices === true) {
    choices = ['y', 'n']
    if (def === true || def === false) {
      def = def ? 'y' : 'n'
    }
  }

  if (Array.isArray(choices)) {
    message += ' ['.grey
      + _.map(choices, function (op) {
          return op === def ? op.green : op.cyan
        }).join('/')
      + ']'.grey
  } else if (def) {
    message += ' (default: '.grey + def.green + ')'.grey
  }

  // Don't make pretty colors for everything until there is a solution for
  // node's readline color bug thing.
  //message = '[' + '?'.green + '] ' + message + ' >'.grey
  message = '[' + '?'.green + '] ' + message.stripColors + ' >'
  return message
}


sj.prompt = function (message, opts, callback) {
  message = sj._decoratePrompt(message, null, opts)
  promptly.prompt(message, opts, callback)
}

sj.confirm = function (message, opts, callback) {
  message = sj._decoratePrompt(message, true, opts)
  promptly.confirm(message, opts, callback)
}

sj.choose = function (message, choices, opts, callback) {
  message = sj._decoratePrompt(message, choices, opts)
  promptly.choose(message, choices, opts, callback)
}

sj.password = function (message, opts, callback) {
  message = sj._decoratePrompt(message, null, opts)
  promptly.password(message, opts, callback)
}


// Overcome a bug in the Nodejs readline implementation wrt colors

var readline = require('readline')
readline.Interface.prototype._setPrompt = readline.Interface.prototype.setPrompt;
readline.Interface.prototype.setPrompt = function (prompt, length) {
  var visibleLength = prompt.split(/[\r\n]/).pop().stripColors.length
    , realLength = prompt.length
  this._setPrompt(prompt, length ? length : visibleLength)
}


// SJ Utility functions defined in sj; load and init each of the tasks in ./tasks

_.each(common.requirePath(path.resolve(__dirname, 'tasks')), function (module, key) {
  if (typeof module === 'function') {
    common.merge(tasks, module(sj))
  }
})

// common.dump(paths)
// common.dump(tasks)

// Done
module.exports = sj