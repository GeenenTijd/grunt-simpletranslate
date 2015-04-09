'use strict';

var path = require('path');
var fs = require('fs');
var async = require('async');

module.exports = function (grunt) {

    var languages;

    function updateKeys(data, keys) {

        if (typeof keys === 'undefined') {
            keys = [];
        }

        var results = data.match(/__\(\'.*?\'\)/g);

        if (results) {
            var substring;

            results.forEach(function (str) {
                substring = str.substring(4, str.length - 2);

                if (!keys.hasOwnProperty(substring)) {
                    keys[substring] = substring;
                }
            });
        }

        return keys;
    }

    function extractFile(file, callback) {

        fs.readFile(file, function (err, data) {

            if (err) {
                return callback(err);
            }

            data = data.toString();

            async.each(languages, function (lang, cb) {

                var p = 'locales/' + lang + '/' + path.basename(file, path.extname(file)) + '.json';

                var keys = {};
                if (grunt.file.exists(p)) {
                    fs.readFile(p, function (err, js) {

                        keys = JSON.parse(js.toString());
                        keys = updateKeys(data, keys);
                        grunt.file.write(p, JSON.stringify(keys));
                        cb();

                    });
                } else {

                    keys = updateKeys(data, keys);
                    grunt.file.write(p, JSON.stringify(keys));
                    cb();

                }

            }, callback);

        });
    }

    function extractFiles(gruntFiles, callback) {

        var queue = async.queue(extractFile, 4);

        queue.drain = function () {

            grunt.log.writeln('Extracting files done.');

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
            });

            if (files.length === 0) {
                grunt.log.writeln('No files found for this path(s): ' + f.orig.src.join(', '));
            }
            queue.push(files);

        });
    }

    grunt.registerMultiTask('simpleextract', 'Extract translation strings from document and put them in a json file.', function () {

        languages = this.options().languages || ['en'];

        extractFiles(this.files, this.async());
    });
};