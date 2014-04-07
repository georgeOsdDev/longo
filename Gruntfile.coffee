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
                  /*!
                   * <%= pkg.name %>
                   * <%= pkg.homepage %>
                   *
                   * The MIT License (MIT)
                   * Copyright (c) 2014 <%= pkg.author %>
                   */

                  """

          mangle:true
          sourceMap:'longo.min.map'
        files:
          'longo.min.js': 'longo.js'
          'longoCollectionWorker.min.js': 'longoCollectionWorker.js'

    usebanner:
      main:
        options:
          position: 'top'
          banner: """
                  /*!
                   * <%= pkg.name %>
                   * <%= pkg.homepage %>
                   *
                   * The MIT License (MIT)
                   * Copyright (c) 2014 <%= pkg.author %>
                   */

                  """
          linebreak: false
        files:
          src: ['longo.js','longoCollectionWorker.js']



    yuidoc:
      main:
        name: 'LONGO API'
        description: '<%= pkg.description %>'
        version: '<%= pkg.version %>'
        url: '<%= pkg.hompage %>'
        options:
          paths: '.'
          outdir: 'docs'
          syntaxtype: 'js'
          extension: '.js'
          linkNatives: "true"
          attributesEmit: "true"

    mochaTest:
      test:
        src: ['test/spec/*.test.coffee']
        options:
          reporter: 'tap'
          captureFile: 'test/results/result.txt'
          'no-colors': true


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
  grunt.loadNpmTasks 'grunt-contrib-yuidoc'
  grunt.loadNpmTasks 'grunt-mocha-test'
  grunt.loadNpmTasks 'grunt-mocha-phantomjs'


  grunt.registerTask 'build',    ['jshint','mocha_phantomjs','uglify','usebanner','yuidoc']

  grunt.registerTask 'default', 'Log some stuff.', ->
    grunt.log.write("""
      --- Available tasks ---
      * jshint          : Run linter
      * uglify          : Run UglifyJS command
      * usebanner       : Add bunner comment
      * yuidoc          : Publish API documents
      * mochaTest       : Run cli test
      * mocha_phantomjs : Run Phantom.JS Test
      * build           : Do everything avobe
    """).ok()
