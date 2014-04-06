/**
 * @fileOverview
 * A dictionary importer class working from streamed text.
 */

var util = require('util');
var _ = require('underscore');
var DictionaryTransformStream = require('../util/dictionaryTransformStream');
var Importer = require('../importer');

/**
 * @class
 * A dictionary importer class working from streamed text.
 *
 * @see Importer.
 */
function ReadStreamImporter(generator) {
  ReadStreamImporter.super_.call(this, generator);
}
util.inherits(ReadStreamImporter, Importer);

//---------------------------------------------------------------------------
// Methods to be implemented by subclasses.
//---------------------------------------------------------------------------

/**
 * Import a dictionary from a read stream.
 *
 * The options have the form:
 *
 * {
 *   readStream: readStream,
 *   // For tokenizing the stream of words.
 *   wordDelimiter: /[\s!\?]+/,
 *   // All words failing this regular expression are rejected. Use it to
 *   // control acceptable length and characters. The word is lowercased
 *   // before matching.
 *   acceptanceRegExp: /^[a-z\-]{6,14}$/,
 *   // Limit duplicate cache size if memory is a concern. This will let
 *   // duplicates through.
 *   duplicateCacheSize: Infinity
 * }
 *
 * @see Importer#import
 */
ReadStreamImporter.prototype.import = function (options, callback) {
  var self = this;
  options = options || {};
  var words = {};

  var dtsOptions = _.pick(
    options,
    'wordDelimiter',
    'acceptanceRegExp',
    'duplicateCacheSize'
  );
  var dts = new DictionaryTransformStream(dtsOptions);

  if (!options.readStream) {
    return callback('options.readStream is required.');
  }

  function newWord(word) {
    // TODO: batching, add words along the way rather than all at the end.
    words[word] = true;
  }

  function finish(error) {
    if (error) {
      options.readStream.unpipe(dts);
      callback(error);
    }
    self.generator.appendWordsToDictionary(_.keys(words), callback);
  }

  dts.on('data', newWord);
  dts.on('error', finish);
  dts.on('finish', finish);

  options.readStream.pipe(dts);
};

//---------------------------------------------------------------------------
// Export: Class constructor.
//---------------------------------------------------------------------------

module.exports = ReadStreamImporter;
