module.exports = function (grunt) {
    'use strict';

    // Configuration
    grunt.initConfig({

        jshint: {
            all: ['Gruntfile.js', 'src/**/*.js'] // , 'dist/**/*.js'
        },

        uglify: {
            dist: {
                files: {
                'dist/teleperiod.min.js': [
                    'src/selection.js',
                    'src/teleperiod.js',
                    'src/timeline.js',
                    'src/timespan-boundary.js'
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', [
        'jshint', 'uglify', 'cssmin'
    ]);
}
