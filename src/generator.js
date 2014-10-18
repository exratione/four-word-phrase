/**
 * @fileOverview
 * Main interface class for generating deterministic sequences of pseudo-random
 * phrases.
 */

var crypto = require('crypto');
var _ = require('underscore');
var async = require('async');
var seedrandom = require('seedrandom');

/**
 * @class
 * Class for generating deterministic pseudo-random phrases from a dictionary.
 *
 * Options will vary by subclass, but must include:
 *
 * {
 *   // The basis for the pseudo-random number generator seeds.
 *   baseSeed: ''
 * }
 *
 * @param {Dictionary} dictionary
 *   A Dictionary instance.
 * @param {Object} options
 *   Configuration for this instance.
 */
function Generator(dictionary, options) {
  this.dictionary = dictionary;
  this.options = _.extend({
    baseSeed: ''
  }, options);
}

//---------------------------------------------------------------------------
// Methods.
//---------------------------------------------------------------------------

/**
 * Generate a phrase of a set number of words.
 *
 * This will be deterministic for the provided settings. If starting over with
 * the same base seed and dictionary then the sequence of phrases will be the
 * same.
 *
 * @param {number} phraseLength
 *   The number of words in the phrase.
 * @param {Function} callback
 *   Of the form function(error, string[]).
 *
 */
Generator.prototype.nextPhrase = function (phraseLength, callback) {
  var self = this;
  var dictionaryLength;
  var count;
  var prngFn;
  var words;

  async.series({
    getDictionaryLength: function (asyncCallback) {
      self.dictionary.getLength(function (error, length) {
        dictionaryLength = length;
        asyncCallback(error);
      });
    },
    incrementCount: function (asyncCallback) {
      self.incrementCount(function (error, incrementedCount) {
        count = incrementedCount;
        asyncCallback(error);
      });
    },
    obtainPrng: function (asyncCallback) {
      self.getPhrasePrngFunction(count, function (error, fn) {
        prngFn = fn;
        asyncCallback(error);
      });
    },
    assemblePhrase: function (asyncCallback) {
      var wordIndices = [];
      for (var index = 0; index < phraseLength; index++) {
        wordIndices[index] = Math.floor(prngFn() * dictionaryLength);
      }
      self.dictionary.getWordsAt(wordIndices, function (error, results) {
        words = results;
        asyncCallback(error);
      });
    }
  }, function (error) {
    if (!_.isArray(words)) {
      words = [];
    }
    callback(error, words);
  });
};

/**
 * Obtain a seeded pseudo-random number generator function for the given count.
 *
 * The function can be called prngFn() to return a uniform random number between
 * 0 and 1, as is the usual practice.
 *
 * @param {number} count
 *   The count of the phrase to be generated using this prng function.
 * @param {Function} callback
 *   Of the form function (error, prngFn).
 */
Generator.prototype.getPhrasePrngFunction = function (count, callback) {
  if (!/^\d+$/.test(count)) {
    return callback(new Error('Count must be an integer. Value provided: ' + count));
  }

  var seed = '' + this.options.baseSeed + count;
  seed = crypto.createHash('md5').update(seed).digest('hex');
  var prng = seedrandom(seed);
  callback(null, prng);
};

//---------------------------------------------------------------------------
// Methods to be implemented by subclasses.
//---------------------------------------------------------------------------

/**
 * Obtain the count of the number of phrases requested.
 *
 * @param {Function} callback
 *   Of the form function (error, count).
 */
Generator.prototype.getCount = function (callback) {
  callback(new Error('Not implemented'));
};

/**
 * Set the count of the number of phrases requested.
 *
 * This is only necessary if you need to adjust the stored count, such as in
 * testing. Generally it is left unused.
 *
 * @param {number} count
 *   Integer count.
 * @param {Function} callback
 *   Of the form function (error).
 */
Generator.prototype.setCount = function (count, callback) {
  callback(new Error('Not implemented'));
};

/**
 * Increment the count of the number of phrases requested.
 *
 * @param {Function} callback
 *   Of the form function (error, count).
 */
Generator.prototype.incrementCount = function (callback) {
  callback(new Error('Not implemented'));
};

//---------------------------------------------------------------------------
// Export: Class constructor.
//---------------------------------------------------------------------------

module.exports = Generator;
