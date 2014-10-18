/**
 * @fileOverview
 * The main four-word-phrase module file. Really just a list of components.
 */

var childProcess = require('child_process');
var path = require('path');
var util = require('util');

/**
 * Run the bash script to download English text files from Project Gutenberg.
 *
 * Note that as written here this is a 36 to 48 hour process on a fast
 * connection, with pauses between downloads. This minimizes impact on the
 * Project Gutenberg servers.
 *
 * It will pick up where it left off if prematurely halted.
 *
 * @param {Function} callback
 *   Of the form function (error).
 */
function runGutenbergDownloader(callback) {
  var command = path.join(__dirname, 'example/projectGutenberg/downloader.sh');
  var args = [];

  var proc = childProcess.spawn(command, args, {
    stdio: 'inherit'
  });

  proc.on('exit', function (exitCode) {
    if (exitCode) {
      callback(new Error(util.format('Process exited with code: %d', exitCode)));
    } else {
      callback();
    }
  });
}

module.exports = {
  // Dictionary implementations.
  dictionary: {
    Dictionary: require('./src/dictionary'),
    MemoryDictionary: require('./src/memoryDictionary')
  },
  // Phrase generators.
  generator: {
    Generator: require('./src/generator'),
    MemoryGenerator: require('./src/generator/memoryGenerator'),
  },
  // Dictionary importers.
  importer: {
    Importer: require('./src/importer'),
    ReadStreamImporter: require('./src/importer/readStreamImporter')
  },
  // Utilities.
  util: {
    DictionaryTransformStream: require('./src/util/dictionaryTransformStream')
  },
  // Examples.
  example: {
    mobyDick: {
      generateDictionary: require('./example/mobyDick/generateDictionary'),
      generatePhrases: require('./example/mobyDick/generatePhrases')
    },
    projectGutenberg: {
      downloadFiles: runGutenbergDownloader,
      generateDictionary: require('./example/projectGutenberg/generateDictionary'),
      generatePhrases: require('./example/projectGutenberg/generatePhrases')
    }
  }
};
