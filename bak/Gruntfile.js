/*
  Copyright 2013 Northern Arizona University

  This file is part of Sweet Jumps.

  Sweet Jumps is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

  Sweet Jumps is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with Sweet Jumps. If not, see <http://www.gnu.org/licenses/>.
*/

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    // Config
    pkg: grunt.file.readJSON('package.json'),
    path: {
      js_src: 'app/scripts',
      js_dest: 'static/js',
      css_src: 'app/styles',
      css_dest: 'static/css'
    },
    // Nodemon - Runs the server and restarts on changes
    nodemon: {
      server: {
        script: 'server.js',
        options: {
          args: [],
          nodeArgs: [],
          ignore: ['README.md', 'test/**', 'node_modules/**', '.git/**', '.idea/**'],
          //ext: ['js'],
          //watch: ['test', 'tasks'],
          delayTime: 1,
          env: {
            NODE_ENV: 'prod'
          },
          cwd: __dirname,
          exec: 'node'
        }
      }
    },
    // Mocha - Runs tests in the test directory
    mocha: {
      all: {
        src: 'test/**/*.test.*'
      },
      test: {
        src: null
      },
      nyan: {
        options: {
          reporter: 'nyan'
        },
        src: 'test/**/*.test.*'
      }
    },
    // Linter - See .jshintrc for options
    jshint: {
      all: [
        'app/**/*.js',
        'modules/**/*.js',
        'plugins/**/*.js',
        'server*.js'
      ],
      options: {
        jshintrc: '.jshintrc',
        ignores: [
          'modules/**/node_modules/**/*.js',
          'app/scripts/**/*.js'
        ]
      }
    },
    // Uglify - TODO: Replace with closure
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: '<%= path.js_src %>/main.js',
        dest: '<%= path.js_dest %>/main.min.js'
      }
    },
    // Sass compiler - TODO: Replace with stylus?
    sass: {
      check: {
        options: { check: true },
        files: {
          '<%= path.css_dest %>/main.css': '<%= path.css_src %>/main.scss'
        }
      },
      build: {
        options: {
          style: 'compact',
          compass: true
        },
        files: {
          '<%= path.css_dest %>/main.css': '<%= path.css_src %>/main.scss'
        }
      }
    },
    // Watches for changes in given files and reruns tasks
    watch: {
      uglify: {
        options: { atBegin: true },
        files: ['<%= path.js_src %>/*.js', '<%= path.js_src %>/**/*.js'],
        tasks: ['uglify']
      },
      sass: {
        options: { atBegin: true },
        files: ['<%= path.css_src %>/*.scss', '<%= path.css_src %>/**/*.scss'],
        tasks: ['sass:build']
      },
      client: {
        options: { atBegin: true },
        files: [
          '<%= path.js_src %>/*.js', '<%= path.js_src %>/**/*.js',
          '<%= path.css_src %>/*.scss', '<%= path.css_src %>/**/*.scss'
        ],
        tasks: ['uglify', 'sass:build']
      },

      jshint: {
        options: { atBegin: true },
        files: ['<%= jshint.all %>'],
        tasks: ['jshint'],
      },
      test: {
        options: { atBegin: true },
        files: [
          'app/**/*.js', 'app/**/*.coffee',
          'modules/**/*.js', 'modules/**/*.coffee',
          'plugins/**/*.js', 'plugins/**/*.coffee',
          'test/**/*.js', 'test/**/*.coffee'
        ],
        tasks: ['mocha:all']
      },
      check: {
        options: { atBegin: true },
        files: ['<%= watch.jshint.files %>', '<%= watch.test.files %>'],
        tasks: ['jshint', 'mocha:all']
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-sass')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-nodemon')
  grunt.loadNpmTasks('grunt-shell-spawn')

  /**
   * Dynamic task to run the server with a given env
   * @param  {string} env (default: prod) NODE_ENV
   */
  grunt.registerTask('server', function (env) {
    if (
      !grunt.file.exists(grunt.config('nodemon.server.script'))
      && grunt.file.exists('server-simple.js')
    ) {
      grunt.config('nodemon.server.script', 'server-simple.js')
    }

    if (env) {
      grunt.config('nodemon.server.options.env.NODE_ENV', env || 'prod')

      if (env.match(/^dev/i)) {
        grunt.config('nodemon.server.options.nodeArgs', ['--debug'])
      }
    }

    grunt.task.run('nodemon:server')
  })

  /**
   * Development tasks. Ideally run during development; have two terminal
   * windows open - one running develop:check, and one running develop.
   * Both will restart when files change.
   *
   * develop:check - Lints project files and runs all tests.
   * develop:client - Builds all client files.
   *
   * @param  {string} env (default: dev) 'client'|'check'|NODE_ENV
   */
  grunt.registerTask('develop', function (env) {
    if (env === 'check' || env === 'client') {
      return grunt.task.run('watch:' + env)
    } else {
      grunt.task.run('server:' + (env || 'dev'))
    }
  })

  /**
   * Lints, runs tests, and builds client files.
   * Also is the default task.
   */
  grunt.registerTask('build', ['jshint', 'mocha:all', 'uglify', 'sass:build'])
  grunt.registerTask('default', 'build')

  /**
   * Runs unit tests - All by default, or an individual test file can be specified.
   * @param  {string} file (optional) Path to individual test to run
   */
  grunt.registerTask('test', function (file) {
    grunt.config('mocha.test.src', file || grunt.config('mocha.test.src'))
    grunt.task.run('mocha:test')
  })

  /**
   * Mocha test runner task.
   */
  grunt.registerMultiTask('mocha', 'Runs the mocha test suite', function() {
    var src = this.data.src || 'test/*'
      , options = this.data.options || {}
      , command = ['NODE_ENV=test ./node_modules/.bin/mocha'
                  // , '--compilers coffee:coffee-script'
                  //, '--require coffee-script'
                  , '--require node_modules/sweet-jumps/lib/sweet-jumps/test'
                  , '--reporter ' + (options.reporter || 'spec')
                  , '--colors']
      , e = require('child_process').exec
      , done = this.async()

      delete(options.reporter)
      for (k in options) {
        if (options.hasOwnProperty(k)) {
          if (!Array.isArray(options[k])) {
            options[k] = [options[k]]
          }
          options[k].forEach(function (v) {
            command.push('--' + k + ' ' + v)
          })
        }
      }

      command.push(src)
      //grunt.log.writeln(command.join(' '))
      //
    e(command.join(' '), function (err, stdout, stderr) {
      grunt.log.writeln(stdout)
      grunt.log.writeln(stderr)
      done(true)
    })
  })

}