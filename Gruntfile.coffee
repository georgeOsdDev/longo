module.exports = (grunt) ->
  grunt.option "color", false

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'

    clean: ['dest/*', 'doc/*']

    jshint:
      test: ['src/*.js']
      options:
        jshintrc: '.jshintrc'
        reporter: require 'jshint-stylish'

    uglify:
      main:
        options:
          #the banner is inserted at the top of the output
          banner: """
                  /*
                   * <%= pkg.name %> v-<%= pkg.version %>
                   * Source code can be found at <%= pkg.homepage %>
                   *
                   * @license   The MIT License (MIT)
                   * @copyright Copyright (c) 2014 <%= pkg.author %>
                   */

                  """

          mangle: true
          sourceMap: true
        files:
          'dest/longo.min.js': 'src/longo.js'
          'dest/longoWorker.min.js': 'src/longoWorker.js'

    jsdoc:
      dist:
        src: ['src/*.js', 'ReadMe.md']
        options:
          destination: 'doc'

    mocha_phantomjs:
      all: ['test/*.html']
      options:
        reporter: 'tap'
        output: 'test/result/result.txt'
        C: ' '

    copy:
      src:
        files: [
          {
            expand: true
            flatten: true
            src: ['src/*.js']
            dest: 'dest'
            filter: 'isFile'
          }
        ]
      lib:
        files:[
          {
            expand: true
            cwd: 'node_modules/'
            src: ['underscore/**','underscore-query/**']
            dest: 'dest/lib'
          }

        ]

  # load
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-jsdoc'
  grunt.loadNpmTasks 'grunt-mocha-phantomjs'

  grunt.registerTask 'build', ['clean', 'jshint', 'uglify', 'copy', 'mocha_phantomjs', 'jsdoc'];

  grunt.registerTask 'default', 'Log some stuff.', ->
    grunt.log.write("""
      --- Available tasks ---
      * clean           : Clean up build results
      * jshint          : Run linter
      * uglify          : Run UglifyJS command
      * mocha_phantomjs : Run Phantom.JS Test
      * jsdoc           : Publish API documents
      * build           : Do everything avobe
    """).ok()
