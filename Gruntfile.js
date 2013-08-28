module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    path: {
      js_src: 'app/scripts',
      js_dest: 'static/js',
      css_src: 'app/styles',
      css_dest: 'static/css'
    },
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
    jshint: {
      all: [
        'app/**/*.js',
        'modules/**/*.js',
        'plugins/**/*.js',
        'server*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc',
        ignores: [
          'modules/**/node_modules/**/*.js',
          'app/scripts/**/*.js'
        ]
      }
    },
    nodeunit: {
      tests: ['test/**/*_test.js']
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: '<%= path.js_src %>/main.js',
        dest: '<%= path.js_dest %>/main.min.js'
      }
    },
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
    watch: {
      jshint: {
        options: { atBegin: true },
        files: ['<%= jshint.all %>'],
        tasks: ['jshint'],
      },
      uglify: {
        options: { atBegin: true },
        files: ['<%= path.js_src %>/*.js', '<%= path.js_src %>/**/*.js'],
        tasks: ['uglify']
      },
      sass: {
        options: { atBegin: true },
        files: ['<%= path.css_src %>/*.scss', '<%= path.css_src %>/**/*.scss'],
        tasks: ['sass:build']
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-nodeunit')
  grunt.loadNpmTasks('grunt-contrib-sass')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-nodemon')
  grunt.loadNpmTasks('grunt-shell-spawn')

  // Dynamic alias task to nodeunit. Run individual tests with: grunt test:events
  grunt.registerTask('test', function (file) {
    grunt.config('nodeunit.tests', String(grunt.config('nodeunit.tests')).replace('*', file || '*'))
    grunt.task.run('nodeunit')
  })

  // Dynamic develop task for running server files. Defaults to server.js
  grunt.registerTask('develop-check', ['watch:jshint', 'sass:check'])
  grunt.registerTask('develop-client', ['watch'])
  grunt.registerTask('develop', function (file) {
    if (file) {
      grunt.config('nodemon.server.options.file', file)
    }
    grunt.task.run(['nodemon:server'])
  })

  grunt.registerTask('build', ['jshint', 'uglify', 'sass:build', 'nodeunit'])

  // Default task(s).
  grunt.registerTask('default', 'build')

};