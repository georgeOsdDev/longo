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

    yuidoc:
      main:
        name: '<%= pkg.name %>'
        description: '<%= pkg.description %>'
        version: '<%= pkg.version %>'
        url: '<%= pkg.homepage %>'
        options:
          paths: 'src/'
          outdir: 'doc/'
          linkNatives: "true"
          attributesEmit: "true"

    jsdoc:
      main:
        src: ["src/**.js", "ReadMe.md"]
        options:
          destination: "doc/"
          template: "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template"
          configure: "jsdoc.conf.json"

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
  grunt.loadNpmTasks 'grunt-contrib-yuidoc'
  grunt.loadNpmTasks 'grunt-jsdoc'
  grunt.loadNpmTasks 'grunt-mocha-phantomjs'

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

  grunt.registerTask 'build', ['clean', 'jshint', 'uglify', 'replace', 'copy','mocha_phantomjs', 'jsdoc'];
  grunt.registerTask 'compile', ['clean', 'jshint', 'uglify', 'replace', 'copy'];

  grunt.registerTask 'default', 'Log some stuff.', ->
    grunt.log.write("""
      --- Available tasks ---
      * clean           : Clean up build results
      * jshint          : Run linter
      * uglify          : Run UglifyJS command
      * mocha_phantomjs : Run Phantom.JS Test
      * yuidoc          : Publish API documents
      * build           : Do everything avobe
    """).ok()
