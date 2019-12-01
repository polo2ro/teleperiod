module.exports = function (grunt) {
    'use strict';

    // Configuration
    grunt.initConfig({

        jshint: {
            all: ['GruntFile.js', 'src/**/*.js']
        },

        uglify: {
            dist: {
                files: {
                'dist/teleperiod.min.js': [
                    'src/selection.js',
                    'src/teleperiod.js',
                    'src/timeline.js',
                    'src/timespan-boundary.js',
                    'src/mousedrag.js'
                    ]
                }
            }
        },

        cssmin: {
            target: {
                files: {
                    'dist/teleperiod.min.css': ['styles/teleperiod.css']
                }
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['tests/**/*.js']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('test', ['jshint', 'mochaTest']);
    grunt.registerTask('default', [
        'uglify', 'cssmin'
    ]);
};
