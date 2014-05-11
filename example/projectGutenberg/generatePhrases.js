/**
 * @fileOverview
 * Generate pseudo-random word sequences using the text files of Project
 * Gutenberg as the source for the dictionary.
 */

var async = require('async');
var fs = require('fs');
var path = require('path');
var MemoryGenerator = require('../../src/generator/memoryGenerator');
var ReadStreamImporter = require('../../src/importer/readStreamImporter');

/**
 * Generate phrases from the dictionary created from the Project Gutenberg
 * files.
 *
 * @param {string} seed
 *   Seed for the pseudo-random number generator.
 * @param {number} phraseLength
 *   Number of words per phrase.
 * @param {Function} callback
 *   Of the form function (error, string[]).
 */
module.exports = function (seed, phraseLength, callback) {

  var generator = new MemoryGenerator({
    baseSeed: seed
  });

  var filePath = path.join(__dirname, 'dictionary.txt');
  var readStream = fs.createReadStream(filePath);
  var importer = new ReadStreamImporter(generator);

  importer.import({
    readStream: readStream
  }, function (error) {
    if (error) {
      return callback(error);
    }

    async.times(10, function (index, asyncCallback) {
      generator.nextPhrase(phraseLength, asyncCallback);
    }, function (error, phrases) {
      if (error) {
        return callback(error);
      }

      callback(null, phrases);
    });
  });

};
