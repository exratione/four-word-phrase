/**
 * @fileOverview
 * An interface class for dictionary importers.
 */

/**
 * @class
 * An interface class for dictionary importers.
 *
 * @param {Generator} generator
 *   A generator instance that will have the imported words added to
 *   its dictionary.
 */
function Importer(generator) {
  this.generator = generator;
}

//---------------------------------------------------------------------------
// Methods to be implemented by subclasses.
//---------------------------------------------------------------------------

/**
 * Import words from a source to the generator for this Importer instance.
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
