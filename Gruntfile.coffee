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

    mocha_phantomjs:
      all:
        options:
          urls: [
            'http://localhost:9000/test/index.html'
          ]
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
      sample:
        files: [
          {
            expand: true
            cwd: 'dest'
            src: ['./**']
            dest: 'example/Longo.js'
          }
        ]

    connect:
      server:
        options:
          port: 9000
          base: '.'

  # load
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-jsdoc'
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

  grunt.registerTask 'test', ['connect', 'mocha_phantomjs']
  grunt.registerTask 'build', ['clean', 'jshint', 'uglify', 'replace', 'copy', 'jsdoc', 'test']
  grunt.registerTask 'compile', ['clean', 'jshint', 'uglify', 'replace', 'copy']

  grunt.registerTask 'default', 'Log some stuff.', ->
    grunt.log.write("""
      --- Available tasks ---
      * clean           : Clean up build results
      * jshint          : Run linter
      * uglify          : Run UglifyJS command
      * test            : Run Phantom.JS Test with localhost:9000
      * jsdoc           : Publish API documents
      * build           : Do everything avobe
      * compile         : Do `build` task but not `jsdoc` and `test`
    """).ok()
