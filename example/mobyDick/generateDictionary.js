/**
 * @fileOverview
 * Generate a dictionary from Moby Dick and write it to file.
 */

var fs = require('fs');
var path = require('path');
var fwp = require('../..');

var filePath = path.join(__dirname, 'mobyDick.txt');
var readStream = fs.createReadStream(filePath);

var dictionaryFilePath = path.join(__dirname, 'dictionary.txt');
var writeStream = fs.createWriteStream(dictionaryFilePath);


var dictionaryTransformStream = new fwp.util.DictionaryTransformStream({
  // Since we're going to stream to file, we don't want it to write discrete
  // words as objects.
  objectMode: false,
  // These are the default settings: tokenize on whitespace and a few
  // punctuation marks and look for fairly ordinary words between 5 and 14
  // characters long.
  wordDelimiter: /[\s\.,!\?<>]+/,
  acceptanceRegExp: /^[a-z\-]{5,14}$/,
  rejectionRegExp: /-{2,}|-.*-/,
  // For a text as small as Moby Dick, little reason to manage memory by
  // allowing duplicates past.
  duplicateCacheSize: Infinity
});

readStream.pipe(dictionaryTransformStream).pipe(writeStream);
