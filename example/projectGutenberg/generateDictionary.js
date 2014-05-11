/**
 * @fileOverview
 * Generate a dictionary from the complete set of Project Gutenberg text files.
 *
 * This will run for a while, but generates console output of progress.
 *
 * Periodically it will write out partial progress files to:
 *
 * dictionary.partial.txt
 * processedFiles.partial.txt
 *
 * If halted and started again, it will read in these files and start again.
 */

var fs = require('fs');
var path = require('path');
var util = require('util');

var _ = require('underscore');
var async = require('async');
var fwp = require('../..');

// --------------------------------------------------------------------------
// Preliminaries.
// --------------------------------------------------------------------------

var filesDir = path.join(__dirname, 'files');
if (!fs.existsSync(filesDir)) {
  console.error('Project Gutenberg files are not yet downloaded. Run downloader.sh first.');
  process.exit(1);
}

// --------------------------------------------------------------------------
// Configuration
// --------------------------------------------------------------------------

var config = {
  // If any book after the this count has too high a fraction of new words then
  // ignore it as not being English. Here we are assuming that the first book
  // gives a good number of words - i.e. is a dictionary or similar.
  //
  // This should probably === usefulFiles.length.
  checkMaximumNovelWordsAfterFileCount: 2,
  // Parameters to pass to DictionaryTransformStream instances.
  dictionaryTransformStreamParams: {
    // We want string objects to result from the processing.
    objectMode: true,
    // These are the default settings: tokenize on whitespace and a few
    // punctuation marks and look for fairly ordinary words between 5 and 14
    // characters long.
    wordDelimiter: /[\s\.,!\?<>]+/,
    acceptanceRegExp: /^[a-z\-]{5,14}$/,
    rejectionRegExp: /-{2,}|-.*-/,
    // Each text is fairly modest in size, so little reason to manage memory by
    // allowing duplicates past.
    duplicateCacheSize: Infinity
  },
  // Assume that the first file gives a decent spread of words. Thus any later
  // file that adds too high a percentage of novel words is bad - not English.
  maximumNovelWordsFraction: 0.6,
  paths : {
    filesDirectory: path.join(__dirname, 'files'),
    dictionary: path.join(__dirname, 'dictionary.txt'),
    partialDictionary: path.join(__dirname, 'dictionary.partial.txt'),
    partialProcessedFileList: path.join(__dirname, 'files.partial.txt')
  },
  // We want these files at the head of the list, as they will produce a known
  // set of good words that can be used as a yardstick to throw out
  // miscategorized non-English files.
  usefulFiles: [
    // Complete works of Shakespear.
    '00ws110.txt',
    // A large thesaurus.
    'mthesaur.txt'
  ],
  // How often to write partials? Do so every X files processed. This file
  // is going to get pretty large, so don't do it too often.
  writePartialProgressFilesEvery: 500
};

// --------------------------------------------------------------------------
// Important variables.
// --------------------------------------------------------------------------

// Keeping track of the words in the dictionary.
var dictionary = {};

// Keep track of which files have been processed by absolute path.
var processedFileList = {};

// The list of files to process.
var unprocessedFileList = [];

// --------------------------------------------------------------------------
// Functions for reading and writing the results of processing.
// --------------------------------------------------------------------------

/**
 * Write out the partial dictionary file.
 *
 * @param {function} callback
 *   Of the form function (error).
 */
function writePartialDictionary(callback) {
  var params = {
    encoding: 'utf-8'
  };
  var filePath = config.paths.partialDictionary;
  fs.writeFile(filePath, JSON.stringify(dictionary, null, '  '), params, callback);
}

/**
 * Write out the partial list of processed files.
 *
 * @param {function} callback
 *   Of the form function (error).
 */
function writePartialProcessedFileList(callback) {
  var params = {
    encoding: 'utf-8'
  };
  var filePath = config.paths.partialProcessedFileList;
  fs.writeFile(filePath, JSON.stringify(processedFileList, null, '  '), params, callback);
}

/**
 * Write out partial progress files.
 *
 * @param {function} callback
 *   Of the form function (error).
 */
function writePartialProgressFiles(callback) {
  async.parallel({
    writePartialDictionary: writePartialDictionary,
    writePartialProcessedFileList: writePartialProcessedFileList
  }, callback);
}

/**
 * Read in the partial dictionary file.
 *
 * @param {function} callback
 *   Of the form function (error, dictionaryObj).
 */
function readPartialDictionary(callback) {
  var params = {
    encoding: 'utf-8'
  };

  fs.readFile(config.paths.partialDictionary, params, function (error, contents) {
    if (error) {
      console.info('No partial dictionary found. Starting from scratch.');
      return callback();
    }
    try {
      dictionary = JSON.parse(contents);
      console.info('Partial dictionary from earlier run found and loaded.');
      callback();
    } catch (error) {
      callback(error);
    }
  });
}

/**
 * Read in the partial list of processed files.
 *
 * @param {function} callback
 *   Of the form function (error, processedFileListObj).
 */
function readPartialProcessedFileList(callback) {
  var params = {
    encoding: 'utf-8'
  };

  fs.readFile(config.paths.partialProcessedFileList, params, function (error, contents) {
    if (error) {
      console.info('No partial processed file list found. Starting from scratch.');
      return callback();
    }
    try {
      processedFileList = JSON.parse(contents);
      console.info(util.format(
        'Partial processed file list loaded from earlier run: %s files processed already.',
        _.size(processedFileList)
      ));
      callback();
    } catch (error) {
      callback(error);
    }
  });
}

/**
 * Write out the partial dictionary file.
 *
 * @param {function} callback
 *   Of the form function (error).
 */
function deletePartialDictionary(callback) {
  fs.unlink(config.paths.partialDictionary, callback);
}

/**
 * Write out the partial list of processed files.
 *
 * @param {function} callback
 *   Of the form function (error, processedFileListObj).
 */
function deletePartialProcessedFileList(callback) {
  fs.unlink(config.paths.partialProcessedFileList, callback);
}

// --------------------------------------------------------------------------
// Functions for obtaining the list of files.
// --------------------------------------------------------------------------

/**
 * Should we skip this file?
 *
 * @param {string} filename
 *   The name of the file.
 * @param {string} filePath
 *   The full path of the file.
 * @param {Stats} stat
 *   An fs.Stats instance.
 * @return {boolean}
 *   True if skipping this file.
 */
function skipFile(filename, filePath, stats) {
  if (!stats) {
    return true;
  }

  // We already processed this one in an earlier run.
  if (processedFileList[filePath]) {
    return true;
  }

  if (
    // The big stuff is all Human Genome Project data.
    stats.size > (24 * 1024 * 1024) ||
    // Some Human Genome Project files are identified by name.
    filename.match(/^\d+hgp\d+/)
  ) {
    return true;
  }

  return false;
}

/**
 * Return a list of all files in the provided directory and its subdirectories.
 * Paths returned are absolute.
 *
 * This will skip files that are known to be unhelpful, or were already
 * processed in a prior run.
 *
 * @param {string} dir
 *   Absolute path to the directory.
 * @param {function} callback
 *   Of the form function (error, files).
 */
function generateRecursiveFileList(dir, callback) {
  fs.readdir(dir, function (error, contents) {
    if (error) {
      return callback(error, []);
    }

    async.each(contents, function(file, asyncCallback) {
      var absFile = path.join(dir, file);
      fs.stat(absFile, function (error, stats) {
        if (error) {
          return asyncCallback(error);
        }

        // Recurse into a directory.
        if (stats && stats.isDirectory()) {
          generateRecursiveFileList(absFile, function (error, subdirectoryFiles) {
            if (error) {
              return asyncCallback(error);
            }

            unprocessedFileList.concat(subdirectoryFiles);
          });
        }
        // Or add a file to the growing list.
        else {
          if (!skipFile(file, absFile, stats)) {
            // Make sure the useful ones end up in front.
            if (_.contains(config.usefulFiles, file)) {
              unprocessedFileList.unshift(absFile);
            } else {
              unprocessedFileList.push(absFile);
            }
          }
        }

        asyncCallback();
      });
    }, callback);
  });
}

/**
 * Return a list of all files yet to be processed.
 *
 * @param {function} callback
 *   Of the form function (error, files).
 */
function generateUnprocessedFileList(callback) {
  generateRecursiveFileList(config.paths.filesDirectory, callback);
}

// --------------------------------------------------------------------------
// Functions to process files into the dictionary one by one.
// --------------------------------------------------------------------------

/**
 * Run through the files one by one.
 *
 * Periodically write out partial progress files.
 *
 * @param {function} callback
 *   Of the form function (error).
 */
function processFiles (callback) {
  console.info(util.format('Processing %d files...', unprocessedFileList.length));

  async.eachSeries(unprocessedFileList, function (file, asyncCallback) {

    // ----------------------------------------------------------------------
    // Set up variables.
    // ----------------------------------------------------------------------

    var fileCount = _.size(processedFileList) + 1;

    console.info('-------------------------------------------');
    console.info(util.format('#%d : %s :', fileCount, file));

    var time = Date.now();
    // Number of unique words from this file.
    var uniqueWordCount = 0;
    // Number of these words not already in the dictionary.
    var novelWords = [];

    var readStream = fs.createReadStream(file);
    var dictionaryTransformStream = new fwp.util.DictionaryTransformStream(config.dictionaryTransformStreamParams);

    // ----------------------------------------------------------------------
    // Define functions.
    // ----------------------------------------------------------------------

    /**
     * React to readable events from the stream, and pull out the words it is
     * delivering.
     */
    function readableListener() {
      var word;
      do {
        // Don't pass a size value to read, as an object stream always returns
        // one object from a read request.
        word = dictionaryTransformStream.read();
        if (word) {
          uniqueWordCount++;
          if (!dictionary[word]) {
            novelWords[novelWords.length] = word;
          }
        }
      } while (word);
    }

    /**
     * The stream has finished, so wrap things up for this file.
     */
    function finishListener() {
      readStream.unpipe();
      processedFileList[file] = true;

      console.info(util.format(
        'Complete in %dms : %d unique words : %d new words.',
        Date.now() - time,
        uniqueWordCount,
        novelWords.length
      ));

      // The check for non-English files that might have slipped through. Assume
      // that the first files give a decent spread of words. Thus any later file
      // that adds too high a percentage of novel words is bad.
      if (fileCount > config.checkMaximumNovelWordsAfterFileCount) {
        if (novelWords.length / uniqueWordCount > config.maximumNovelWordsFraction) {
          console.info('Novel word fraction too high. Rejecting as non-English.');
          return asyncCallback();
        }
      }

      // Add the new words to the dictionary.
      _.each(novelWords, function (word) {
        dictionary[word] = true;
      });

      console.info(util.format('Dictionary now contains %d words.', _.size(dictionary)));

      // Are we writing out partial progress at this point?
      if (fileCount % config.writePartialProgressFilesEvery === 0) {
        writePartialProgressFiles(asyncCallback);
      } else {
        asyncCallback();
      }
    }

    // ----------------------------------------------------------------------
    // Set up the streams and start things running.
    // ----------------------------------------------------------------------

    dictionaryTransformStream.on('readable', readableListener);
    dictionaryTransformStream.on('finish', finishListener);
    dictionaryTransformStream.on('error', asyncCallback);
    readStream.pipe(dictionaryTransformStream);

  }, callback);
}

// --------------------------------------------------------------------------
// Completion functions.
// --------------------------------------------------------------------------

/**
 * Write out the dictionary.
 *
 * @param {function} callback
 *   Of the form function (error).
 */
function writeFinalDictionary(callback) {
  var dictionaryArray = _.keys(dictionary).sort();
  var params = {
    encoding: 'utf-8'
  };

  // TODO: a way of doing this that doesn't double the memory footprint.
  fs.writeFile(config.paths.dictionary, dictionaryArray.join('\n') + '\n', params, callback);
}

/**
 * Finish up after completion.
 *
 * @param {Error} error
 */
function finish(error) {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.info('-------------------------------------------');
  console.info(util.format('Final dictionary size: %s', _.size(dictionary)));
}

// --------------------------------------------------------------------------
// Run the operation.
// --------------------------------------------------------------------------

var fns = {
  readPartialProcessedFileList: readPartialProcessedFileList,
  readPartialDictionary: readPartialDictionary,
  generateUnprocessedFileList: generateUnprocessedFileList,
  processFiles: processFiles,
  writeFinalDictionary: writeFinalDictionary,
  deletePartialProcessedFileList: deletePartialProcessedFileList,
  deletePartialDictionary: deletePartialDictionary
};

async.series(fns, finish);
