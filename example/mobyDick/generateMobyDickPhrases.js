/**
 * @fileOverview
 * Generate pseudo-random word sequences using Moby Dick as the source for the
 * dictionary.
 */

var async = require('async');
var fs = require('fs');
var path = require('path');
var fwp = require('..');

var generator = new fwp.generator.MemoryGenerator({
  baseSeed: 'a random seed'
});

var filePath = path.join(__dirname, 'mobyDick.txt');
var readStream = fs.createReadStream(filePath);
var importer = new fwp.importer.ReadStreamImporter(generator);

importer.import({
  readStream: readStream
}, function (error) {
  if (error) {
    return console.error(error);
  }

  var phraseLength = 4;
  async.times(10, function (index, asyncCallback) {
    generator.nextPhrase(phraseLength, asyncCallback);
  }, function (error, phrases) {
    if (error) {
      return console.error(error);
    }
    phrases.forEach(function (phrase, index) {
      console.log('Phrase ' + (index + 1) + ': ' + phrase.join(' '));
    });
  });
});
