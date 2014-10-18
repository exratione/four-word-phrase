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
 * @see Generator
 */
function MemoryGenerator(dictionary, options) {
  MemoryGenerator.super_.call(this, dictionary, options);

  // Count of number of phrases obtained. Defaults to 0.
  this.count = 0;
}
util.inherits(MemoryGenerator, Generator);

//---------------------------------------------------------------------------
// Methods.
//---------------------------------------------------------------------------

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
