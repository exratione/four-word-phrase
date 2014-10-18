/**
 * @fileOverview
 * An interface class for dictionary importers.
 */

/**
 * @class
 * An interface class for dictionary importers.
 *
 * @param {Dictionary} dictionary
 *   Imported words will be added to this dictionary.
 */
function Importer(dictionary) {
  this.dictionary = dictionary;
}

//---------------------------------------------------------------------------
// Methods to be implemented by subclasses.
//---------------------------------------------------------------------------

/**
 * Import words from a source to the dictionary assigned to this Importer
 * instance.
 *
 * @param {object} options
 *   Options for the import.
 * @param {Function} callback
 *   Of the form function (error).
 */
Importer.prototype.import = function (options, callback) {
  callback(new Error('Not implemented'));
};

//---------------------------------------------------------------------------
// Export: Class constructor.
//---------------------------------------------------------------------------

module.exports = Importer;
