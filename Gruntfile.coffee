module.exports = (grunt) ->
  grunt.option "color", false

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'

    jshint:
      test: ['longo.js', 'longoCollectionWorker.js']
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

          mangle:true
          sourceMap:'longo.min.map'
        files:
          'longo.min.js': 'longo.js'
          'longoCollectionWorker.min.js': 'longoCollectionWorker.js'

    # usebanner:
    #   main:
    #     options:
    #       position: 'top'
    #       banner: """
    #               /*
    #                * <%= pkg.name %> v-<%= pkg.version %>
    #                * Source code can be found at <%= pkg.homepage %>
    #                *
    #                * @license   The MIT License (MIT)
    #                * @copyright Copyright (c) 2014 <%= pkg.author %>
    #                */

    #               """
    #       linebreak: false
    #     files:
    #       src: ['longo.js','longoCollectionWorker.js']

    jsdoc:
      dist:
        src: ['longo.js', 'longoCollectionWorker.js', 'ReadMe.md']
        options:
          destination: 'doc'

    mocha_phantomjs:
      all: ['test/spec/**/*.html']
      options:
        reporter: 'tap'
        output: 'test/results/phantom.txt'
        C: ' '

  # load
  grunt.loadNpmTasks 'grunt-banner'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-jsdoc'
  grunt.loadNpmTasks 'grunt-mocha-test'
  grunt.loadNpmTasks 'grunt-mocha-phantomjs'


  grunt.registerTask 'build',    ['jshint','mocha_phantomjs','uglify','usebanner','jsdoc']

  grunt.registerTask 'default', 'Log some stuff.', ->
    grunt.log.write("""
      --- Available tasks ---
      * jshint          : Run linter
      * uglify          : Run UglifyJS command
      * usebanner       : Add bunner comment
      * jsdoc           : Publish API documents
      * mochaTest       : Run cli test
      * mocha_phantomjs : Run Phantom.JS Test
      * build           : Do everything avobe
    """).ok()
