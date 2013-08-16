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
    // OUTPUT NO WORKY
    develop: {
      derp: { file: 'derp.js' },
      server: {
        file: 'server.js',
        nodeArgs: ['--debug'],
        args: ['--node-env=dev']
      },
      'server-simple': {
        file: 'server-simple.js',
        nodeArgs: ['--debug'],
        args: ['--node-env=dev']
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: '<%= path.js_src %>/example.js',
        dest: '<%= path.js_dest %>/main.min.js'
      }
    },
    watch: {
      js: {
        options: {},
        files: '<%= path.js_src %>/example.js',
        tasks: 'uglify'
      }
    }
  })

  grunt.loadNpmTasks('grunt-develop')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-uglify')

  // Default task(s).
  grunt.registerTask('default', ['uglify'])


};