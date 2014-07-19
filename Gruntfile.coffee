module.exports = (grunt) ->
  grunt.option "color", false

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'

    clean: ['dest/*', 'doc/out/']

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
                   * The MIT License (MIT)
                   * Copyright (c) 2014 <%= pkg.author %>
                   */

                  """

          mangle: true
          sourceMap: true
        files:
          'dest/longo.min.js': 'src/longo.js'
          'dest/longoWorker.min.js': 'src/longoWorker.js'

    jsdoc:
      main:
        src: ["src/**.js", "ReadMe.md"]
        options:
          destination: "doc/out/"
          template: "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template"
          configure: "jsdoc.conf.json"
          tutorials: "doc/guide/"

    # Some test case is runnable from console
    # This test will be executed by Travis.ci.
    mochaTest:
      test:
        options:
          reporter: 'tap'
        src: [
          'test/spec/util.js',
          'test/spec/static.js',
          'test/spec/cursor.js',
          'test/spec/worker_funcs.js'
        ]

    # All test case is runnable by PhantomJS
    # But some case will be fail with TypeError
    # Currently we need test with browser(opening http://localhost:9000/test/) by hand.
    mocha_phantomjs:
      all:
        options:
          urls: [
            'http://localhost:9000/test/index.html'
          ]
          reporter: 'tap'
          output: 'test/result/result.txt'
          C: ' '

    connect:
      server:
        options:
          port: 9000
          base: '.'

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
      sample:
        files: [
          {
            expand: true
            cwd: 'dest'
            src: ['./**']
            dest: 'example/Longo.js'
          }
        ]

  # load
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-jsdoc'
  grunt.loadNpmTasks 'grunt-mocha-test'
  grunt.loadNpmTasks 'grunt-mocha-phantomjs'
  grunt.loadNpmTasks 'grunt-contrib-connect'

  grunt.registerTask 'replace', 'replace longo.js to longo.min.js in longoWorker.min.js', ->
    done = @.async()
    { exec } = require 'child_process'
    fs = require 'fs'
    fs.readFile 'dest/longoWorker.min.js', 'utf8', (err,data)->
      if err
        grunt.warn(err)
        return done()
      result = data.replace './longo.js', './longo.min.js'
      fs.writeFileSync 'dest/longoWorker.min.js', result, 'utf-8'
      grunt.log.ok("Succeeded in replacing './longo.js' with './longo.min.js'")
      done()

  grunt.registerTask 'build', ['clean', 'jshint', 'uglify', 'replace', 'copy', 'jsdoc', 'test_cui']
  grunt.registerTask 'compile', ['clean', 'jshint', 'uglify', 'replace', 'copy']
  grunt.registerTask 'test_gui', ['compile', 'connect:server:keepalive']
  grunt.registerTask 'test_cui', ['compile', 'mochaTest']
  grunt.registerTask 'test_phantom', ['compile', 'connect', 'mocha_phantomjs']

  grunt.registerTask 'default', 'Log some stuff.', ->
    grunt.log.write("""
      --- Available tasks ---
      * clean           : Clean up build results
      * jshint          : Run linter
      * uglify          : Run UglifyJS command
      * test_gui        : Start server. you can run test with browser at http://localhost:9000/test/
      * test_cli        : Run cui test with mocha
      * test_phantom    : Run gui test with Phantom.JS at http://localhost:9000/test/ (Some case will be fail.)
      * jsdoc           : Publish API documents
      * build           : Do everything avobe
      * compile         : Do `build` task but not `jsdoc` and `test`
    """).ok()
