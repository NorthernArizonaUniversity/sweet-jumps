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
        options: {
          file: 'server.js',
          args: [],
          nodeArgs: ['--debug'],
          ignoredFiles: ['README.md', 'node_modules/**', '.git/**'],
          //watchedExtensions: ['js'],
          //watchedFolders: ['test', 'tasks'],
          delayTime: 1,
          env: {
            NODE_ENV: 'dev'
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


  // Development task to Lint and run unit tests on file change.
  grunt.registerTask('develop-check', ['watch:check'])
  // Development task to compile client files on change.
  grunt.registerTask('develop-client', ['watch:client'])
  // Dynamic develop task for running server files. Defaults to server.js
  grunt.registerTask('develop', function (file) {
    if (file) {
      grunt.config('nodemon.server.options.file', file)
    }
    grunt.task.run(['nodemon:server'])
  })

  // Lints, runs tests, and builds client files.
  grunt.registerTask('build', 'mocha:all', ['jshint', 'uglify', 'sass:build'])

  // Default task(s).
  grunt.registerTask('default', 'build')

  // Dynamic alias task to mocha. Run individual tests with: grunt test:<file>
  grunt.registerTask('test', function (file) {
    grunt.config('mocha.all', file || grunt.config('mocha.all'))
    grunt.task.run('mocha:all')
  })

  // Mocha test runner.
  grunt.registerMultiTask('mocha','Runs the mocha test suite', function() {
    var src = this.data.src || 'test/*'
      , options = this.data.options || {}
      , command = ['NODE_ENV=test ./node_modules/.bin/mocha'
                  , '--compilers coffee:coffee-script'
                  , '--reporter ' + (options.reporter || 'spec')
                  , '--require coffee-script'
                  , '--require test/bootstrap'
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