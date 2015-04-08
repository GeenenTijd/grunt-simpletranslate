'use strict';

var path = require('path');
var fs = require('fs');
var async = require('async');

module.exports = function (grunt) {

    var languages;

    function replaceText(data, dict) {
        return data.replace(/__\(\'.*?\'\)/g, function (match) {
            var str = match.substring(4, match.length - 2);
            if (dict.hasOwnProperty(str)) {
                return dict[str];
            } else {
                return str;
            }
        });
    }

    function getDest(dest, lang) {
        return path.dirname(dest) + '/' + path.basename(dest, path.extname(dest)) + '-' + lang + path.extname(dest);
    }

    function extractFile(file, callback) {

        var src = file.src;
        var dest = file.dest;

        if (!dest) {
            grunt.log.warn('\nNo destination for "' + src + '".');
            return callback();
        }

        fs.readFile(src, function (err, data) {

            if (err) {
                return callback(err);
            }

            data = data.toString();

            async.each(languages, function (lang, cb) {

                var p = 'locales/' + lang + '/' + path.basename(src, path.extname(src)) + '.json';

                var json = {};

                if (grunt.file.exists(p)) {

                    fs.readFile(p, function (err, js) {
                        if (err) {
                            return cb(err);
                        }
                        json = JSON.parse(js.toString());

                        p = getDest(dest, lang);
                        grunt.file.write(p, replaceText(data, json));
                        cb();

                    });

                } else {
                    grunt.log.warn('\nSource file "' + p + '.json" not found.');
                    var result = replaceText(data, json);
                    grunt.file.write(getDest(dest, lang), replaceText(data, result));
                    cb();
                }
            }, callback);

        });
    }

    function extractFiles(gruntFiles, callback) {

        var queue = async.queue(extractFile, 4);

        queue.drain = function () {

            grunt.log.writeln('Translating files done.');

            callback();
        };

        gruntFiles.forEach(function (f) {

            var files = f.src.filter(function (filepath) {
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('\nSource file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function (filepath) {
                return {
                    src: filepath,
                    dest: f.dest
                };
            });

            if (files.length === 0) {
                grunt.log.writeln('No files found for this path(s): ' + f.orig.src.join(', '));
            }
            queue.push(files);

        });
    }

    grunt.registerMultiTask('simplecompile', 'Compile and translate a files.', function () {

        languages = this.options().languages || ['en'];

        extractFiles(this.files, this.async());
    });
};