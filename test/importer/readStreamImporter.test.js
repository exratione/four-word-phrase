/**
 * @fileOverview
 * Test the ReadStreamImporter class.
 */

var fs = require('fs');
var path = require('path');
var async = require('async');
var expect = require('chai').expect;
var MemoryDictionary = require('../../src/dictionary/memoryDictionary');
var ReadStreamImporter = require('../../src/importer/readStreamImporter');

describe('DictionaryTransformStream', function () {
  var dictionary;
  var readStreamImporter;
  var readStream;
  var expectedDictionary;

  before(function () {
    dictionary = new MemoryDictionary();
    // The expected outcome is stashed as a file, so load it for comparison.
    var dictionaryPath = path.join(__dirname, '../text/mobyDickChapter30Dictionary.txt');
    expectedDictionary = fs.readFileSync(dictionaryPath, 'utf8').trim().split('\n');
  });

  beforeEach(function () {
    readStreamImporter = new ReadStreamImporter(dictionary);
    readStream = fs.createReadStream(path.join(__dirname, '../text/mobyDickChapter30.txt'));
  });

  it('import dictionary', function (done) {
    readStreamImporter.import({
      readStream: readStream,
      wordDelimiter: /[\s\.,!\?<>]+/,
      acceptanceRegExp: /^[a-z\-]{5,14}$/,
      rejectionRegExp: /-{2,}|-.*-/,
      duplicateCacheSize: Infinity
    }, done);
  });

  it('dictionary length is as expected', function (done) {
    dictionary.getLength(function (error, length) {
      expect(length).to.equal(expectedDictionary.length);
      done(error);
    });
  });

  it('dictionary contents are as expected', function (done) {
    var indices = expectedDictionary.map(function (word, index) {
      return index;
    });
    var words = [];

    dictionary.getWordsAt(indices, function (error, words) {
      expect(words).to.deep.equal(expectedDictionary);
      done(error);
    });
  });

});
