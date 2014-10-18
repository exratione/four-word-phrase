/**
 * @fileOverview
 * An in-memory Dictionary implementation class.
 */

var util = require('util');
var _ = require('underscore');
var Dictionary = require('../dictionary');

/**
 * @class
 * An in-memory Dictionary implementation.
 *
 * @see Dictionary
 */
function MemoryDictionary(options) {
  MemoryDictionary.super_.call(this, options);

  this.dictionary = [];
  this.dictionaryObj = {};
}
util.inherits(MemoryDictionary, Dictionary);

//---------------------------------------------------------------------------
// Methods to be implemented by subclasses.
//---------------------------------------------------------------------------

/**
 * @see Dictionary#appendWords
 */
MemoryDictionary.prototype.appendWords = function (words, callback) {
  var self = this;
  if (!words) {
    return callback();
  }
  if (!_.isArray(words)) {
    words = [words];
  }
  _.each(words, function (word) {
    self.dictionaryObj[word] = true;
  });
  this.dictionary = _.keys(this.dictionaryObj).sort();

  callback();
};

/**
 * @see Dictionary#containsWord
 */
MemoryDictionary.prototype.containsWord = function (word, callback) {
  callback(null, !!this.dictionaryObj[word]);
};

/**
 * @see Dictionary#containsWords
 */
MemoryDictionary.prototype.containsWords = function (words, callback) {
  var self = this;
  if (!_.isArray(words)) {
    words = [words];
  }
  callback(null, _.map(words, function (word) {
    return !!self.dictionaryObj[word];
  }));
};

/**
 * @see Dictionary#getWord
 */
MemoryDictionary.prototype.getWordAt = function (wordIndex, callback) {
  callback(null, this.dictionary[wordIndex]);
};

/**
 * @see Dictionary#getWord
 */
MemoryDictionary.prototype.getWordsAt = function (wordIndices, callback) {
  var self = this;
  if (!_.isArray(wordIndices)) {
    wordIndices = [wordIndices];
  }
  callback(null, _.map(wordIndices, function (index) {
    return self.dictionary[index];
  }));
};

/**
 * @see Dictionary#getLength
 */
MemoryDictionary.prototype.getLength = function (callback) {
  callback(null, this.dictionary.length);
};

//---------------------------------------------------------------------------
// Export: Class constructor.
//---------------------------------------------------------------------------

module.exports = MemoryDictionary;
