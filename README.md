# grunt-simpletranslate

Simple extraction and translation task for translating HTML files.
So I have HTML files (using a templating engine should work as well) and want them to be translated.
No PHP or Nodejs, just a HTML file where you mark the strings to translate.

The simpleextract task will extract all strings into a json file.

The simplecompile task will generated all the translated HTML pages with the name page-language. So contact.html for the language 'en' becomes contact-en.html.

Everything between __('') is put in json. __lang becomes -language, this is usefull for links.

## Install

npm install --save-dev grunt-simpletranslate

## Usage

HTML:

    <h2>__('Hello Translation')</h2>
    
Gruntfile.js

    module.exports = function (grunt) {
    
        var languages = ['en', 'nl'];
    
        grunt.initConfig({
    
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
    
        grunt.loadTasks('grunt-simpletranslate');
    
    };

## License

MIT
