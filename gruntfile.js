module.exports = function (grunt) {

    var languages = ['en', 'nl'];

    grunt.initConfig({

        jshint: {
            options: {
                node: true,
                globalstrict: true
            },
            all: ['tasks/**/*.js']
        },

        simpleextract: {
            static: {
                options: {
                    languages: languages
                },
                files: {
                    src: ['test/**/*.html']
                }
            }
        },

        simplecompile: {
            static: {
                options: {
                    languages: languages
                },
                files: [{
                    expand: true,
                    cwd: 'test/',
                    src: ['**/*.html'],
                    dest: 'dist/'
                }]
            }
        }


    });

    grunt.loadTasks('tasks');

};