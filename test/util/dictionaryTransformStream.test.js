/**
 * @fileOverview
 * Test the DictionaryTransformStream class.
 */

var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var expect = require('chai').expect;
var DictionaryTransformStream = require('../../src/util/dictionaryTransformStream');

describe('DictionaryTransformStream', function () {
  var dictionaryTransformStream;
  var readStream;
  var expectedDictionary;
  var expectedDictionaryArray;
  var dictionary;

  var objectModeOptions = {
    wordDelimiter: /[\s\.,!\?<>]+/,
    acceptanceRegExp: /^[a-z\-]{6,14}$/,
    rejectionRegExp: /-{2,}|-.*-/,
    duplicateCacheSize: Infinity
  };
  var nonObjectModeOptions = _.extend({
    objectMode: false
  }, objectModeOptions);

  before(function () {
    // The expected outcome is stashed as a file, so load it for comparison.
    var dictionaryPath = path.join(__dirname, '../text/mobyDickChapter30Dictionary.txt');
    expectedDictionary = fs.readFileSync(dictionaryPath, 'utf8');
    expectedDictionaryArray = expectedDictionary.trim().split('\n');
  });

  describe('with objectMode = true', function () {

    beforeEach(function () {
      dictionary = [];
      dictionaryTransformStream = new DictionaryTransformStream(objectModeOptions);
      readStream = fs.createReadStream(path.join(__dirname, '../text/mobyDickChapter30.txt'));
      readStream.pipe(dictionaryTransformStream);
    });

    it('in non-flowing mode', function (done) {
      dictionaryTransformStream.on('readable', function () {
        var word;
        do {
          // Don't pass a size value to read, as an object stream always returns
          // one object from a read request.
          word = dictionaryTransformStream.read();
          if (word) {
            dictionary.push(word);
          }
        } while (word);
      });

      dictionaryTransformStream.on('finish', function () {
        expect(dictionary.sort()).to.deep.equal(expectedDictionaryArray);
        done();
      });
    });

    it('in flowing mode', function (done) {
      dictionaryTransformStream.on('data', function (word) {
        dictionary.push(word);
      });

      dictionaryTransformStream.on('finish', function () {
        expect(dictionary.sort()).to.deep.equal(expectedDictionaryArray);
        done();
      });
    });

  });

  describe('with objectMode = false', function () {

    beforeEach(function () {
      dictionary = '';
      dictionaryTransformStream = new DictionaryTransformStream(nonObjectModeOptions);

      readStream = fs.createReadStream(path.join(__dirname, '../text/mobyDickChapter30.txt'));
      readStream.pipe(dictionaryTransformStream);
    });

    it('in non-flowing mode', function (done) {
      dictionaryTransformStream.on('readable', function () {
        var word;
        do {
          // Don't pass a size value to read, as an object stream always returns
          // one object from a read request.
          word = dictionaryTransformStream.read();
          if (word) {
            dictionary = dictionary += word;
          }
        } while (word);
      });

      dictionaryTransformStream.on('finish', function () {
        dictionary = dictionary.trim().split('\n');
        expect(dictionary.sort()).to.deep.equal(expectedDictionaryArray);
        done();
      });
    });

    it('in flowing mode', function (done) {
      dictionaryTransformStream.on('data', function (word) {
        dictionary = dictionary += word;
      });

      dictionaryTransformStream.on('finish', function () {
        dictionary = dictionary.trim().split('\n');
        expect(dictionary.sort()).to.deep.equal(expectedDictionaryArray);
        done();
      });
    });

  });

});
