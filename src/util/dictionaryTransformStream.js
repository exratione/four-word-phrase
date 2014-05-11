/**
 * @fileOverview
 * A transforming stream that accepts reads and writes text, transforming a
 * raw text into something less voluminous and more useful as the basis for
 * a dictionary.
 */

var Transform = require('stream').Transform;
var util = require('util');
var lruCache = require('lru-cache');

/**
 * @class
 * A transforming stream that converts raw text into something less voluminous
 * and more useful as the basis for a dictionary.
 *
 * This defaults to acting as an object stream: it reads from text streams but
 * writes discrete string words. This is useful when reading in to add words to
 * a generator implementation.
 *
 * To make this more helpful for writing dictionaries to file, set objectMode to
 * false in the options. In that mode it will write words with line breaks.
 *
 * In addition to the normal stream options, the following are used:
 *
 * {
 *   // If objectMode is set to false, then it is false. Otherwise it defaults
 *   // to true. This determines whether the output is discrete words as strings
 *   // or streamed text with line breaks between words.
 *   //objectMode: false,
 *   // For tokenizing the stream of words.
 *   wordDelimiter: /[\s\.,!\?<>]+/,
 *   // All words failing this regular expression are rejected. Use it to
 *   // control acceptable length and characters. The word is lowercased
 *   // before matching.
 *   acceptanceRegExp: /^[a-z\-]{6,14}$/,
 *   // All words matching this regular expression are rejected.
 *   rejectionRegExp: /-{2,}|-.*-/,
 *   // Limit duplicate cache size if memory is a concern. This will let
 *   // duplicates through.
 *   duplicateCacheSize: Infinity
 * }
 *
 * @param {Object} options
 *   Options for the stream.
 */
function DictionaryTransformStream(options) {
  // Set up the stream.
  options = options || {};
  // Default object mode to true.
  if (options.objectMode !== false) {
    options.objectMode = true;
  }
  DictionaryTransformStream.super_.call(this, options);

  this.objectMode = options.objectMode;
  // Set up the specifics for splitting up the input and removing duplicates.
  this.wordDelimiter = options.wordDelimiter || /[\s\.,!\?<>]+/;
  this.acceptanceRegExp = options.acceptanceRegExp || /^[a-z\-]{6,14}$/;
  this.rejectionRegExp = options.rejectionRegExp || /-{2,}|-.*-/;
  this.duplicateCacheSize = options.duplicateCacheSize || Infinity;

  this.cache = lruCache({
    max: this.duplicateCacheSize
  });

  // When we're stuck halfway through a word this holds the piece we haven't
  // processed yet.
  this.fragment = '';
}
util.inherits(DictionaryTransformStream, Transform);

//---------------------------------------------------------------------------
// Implementations of parent class methods.
//---------------------------------------------------------------------------

/**
 * @see Transform#_transform
 */
DictionaryTransformStream.prototype._transform = function (chunk, encoding, callback) {
  var self = this;
  var str = this.fragment + chunk.toString();
  var words = str.split(this.wordDelimiter);

  // The last of it might be a word fragment.
  this.fragment = words.pop();

  words.forEach(function (word) {
    self.pushWord(word);
  });

  callback();
};

/**
 * @see Transform#_flush
 */
DictionaryTransformStream.prototype._flush = function () {
  // If we still have a fragment left at the end, then it was actually a full
  // word.
  this.pushWord(this.fragment);
  this.fragment = '';
};

//---------------------------------------------------------------------------
// Utility methods.
//---------------------------------------------------------------------------

/**
 * If the word is acceptable, push it to be written.
 *
 * @param {string} word
 */
DictionaryTransformStream.prototype.pushWord = function (word) {
  if (word && !this.cache.get(word)) {
    this.cache.set(word, true);
    if(this.acceptanceRegExp.test(word) && !this.rejectionRegExp.test(word)) {
      // If not in object mode we're streaming out a line-break delimited list
      // of words.
      if (!this.objectMode) {
        word = word + '\n';
      }
      this.push(word);
    }
  }
};

//---------------------------------------------------------------------------
// Export: Class constructor.
//---------------------------------------------------------------------------

module.exports = DictionaryTransformStream;
