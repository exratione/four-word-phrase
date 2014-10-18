/**
 * @fileOverview
 * Main interface class for dictionaries of words.
 */

var crypto = require('crypto');
var _ = require('underscore');
var async = require('async');
var seedrandom = require('seedrandom');

/**
 * @class
 * Class for representing a dictionary.
 *
 * @param {object} options
 *   Configuration for this instance.
 */
function Dictionary(options) {
  this.options = _.extend({}, options);
}

//---------------------------------------------------------------------------
// Methods to be implemented by subclasses.
//---------------------------------------------------------------------------

/**
 * Add to the dictionary used by this generator instance.
 *
 * @param {String[]} words
 *   The words to append to the dictionary.
 * @param {Function} callback
 *   Of the form function (error).
 */
Dictionary.prototype.appendWords = function (words, callback) {
  callback(new Error('Not implemented'));
};

/**
 * Determine whether a specific word is present in the dictionary.
 *
 * @param {String} word
 *   The word to check.
 * @param {Function} callback
 *   Of the form function (error, boolean).
 */
Dictionary.prototype.containsWord = function (word, callback) {
  callback(new Error('Not implemented'));
};

/**
 * Determine whether one or more words are present in the dictionary.
 *
 * @param {String} words
 *   The words to check.
 * @param {Function} callback
 *   Of the form function (error, boolean[]).
 */
Dictionary.prototype.containsWords = function (words, callback) {
  callback(new Error('Not implemented'));
};

/**
 * Get a word from the dictionary by referencing a specific index.
 *
 * @param {Number} wordIndex
 *   Index of the word in the dictionary ordering.
 * @param {Function} callback
 *   Of the form function (error, word).
 */
Dictionary.prototype.getWordAt = function (wordIndex, callback) {
  callback(new Error('Not implemented'));
};

/**
 * Get words from the dictionary by referencing indices
 *
 * @param {Number[]} wordIndices
 *   Indices of the word in the dictionary ordering.
 * @param {Function} callback
 *   Of the form function (error, word).
 */
Dictionary.prototype.getWordsAt = function (wordIndices, callback) {
  callback(new Error('Not implemented'));
};

/**
 * Return the length of the dictionary.
 *
 * @param {Function} callback
 *   Of the form function (error, length).
 */
Dictionary.prototype.getLength = function (callback) {
  callback(new Error('Not implemented'));
};

//---------------------------------------------------------------------------
// Export: Class constructor.
//---------------------------------------------------------------------------

module.exports = Dictionary;
