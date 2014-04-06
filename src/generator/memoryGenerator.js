/**
 * @fileOverview
 * In-memory implementation class for generating phrases.
 */

var util = require('util');
var _ = require('underscore');
var Generator = require('../generator');

/**
 * @class
 * Class for generating deterministic unique phrases from a dictionary, with
 * in-memory storage.
 *
 * This is suitable for testing and experimentation.
 *
 * @param {object} options
 *   Configuration for this instance.
 */
function MemoryGenerator(options) {
  MemoryGenerator.super_.call(this, options);

  this.dictionary = [];

  // Count of number of phrases obtained. Defaults to 0.
  this.count = 0;
}
util.inherits(MemoryGenerator, Generator);

//---------------------------------------------------------------------------
// Methods.
//---------------------------------------------------------------------------

/**
 * @see Generator.appendWordsToDictionary
 */
MemoryGenerator.prototype.appendWordsToDictionary = function (words, callback) {
  if (!_.isArray(words)) {
    words = [words];
  }
  this.dictionary = _.union(this.dictionary, words);
  callback();
};

/**
 * @see Generator#getWord
 */
MemoryGenerator.prototype.getWord = function (wordIndex, callback) {
  callback(null, this.dictionary[wordIndex]);
};

/**
 * @see Generator.getDictionaryLength
 */
MemoryGenerator.prototype.getDictionaryLength = function (callback) {
  callback(null, this.dictionary.length);
};

/**
 * @see Generator.getCount
 */
MemoryGenerator.prototype.getCount = function (callback) {
  callback(null, this.count);
};

/**
 * @see Generator.setCount
 */
MemoryGenerator.prototype.setCount = function (count, callback) {
  this.count = count;
  callback();
};

/**
 * @see Generator.incrementCount
 */
MemoryGenerator.prototype.incrementCount = function (callback) {
  this.count = this.count + 1;
  callback(null, this.count);
};

//---------------------------------------------------------------------------
// Export: Class constructor.
//---------------------------------------------------------------------------

module.exports = MemoryGenerator;
