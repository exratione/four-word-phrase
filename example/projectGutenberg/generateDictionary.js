/**
 * @fileOverview
 * Generate a dictionary from the complete set of Project Gutenberg text files.
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
// Obtain the list of files.
// --------------------------------------------------------------------------

// We want these files at the head of the list, as they will produce a known
// set of good words that can be used as a yardstick to throw out miscategorized
// non-English files.
var usefulFiles = [
  // A dictionary.
  'mthesaur.txt'
];

/**
 * Should we skip this file?
 *
 * This is largely an effort to avoid big data files such as the Human Genome
 * Project material.
 *
 * @param {string} filename
 *   The name of the file.
 * @param {Stats} stat
 *   An fs.Stats instance.
 * @return {boolean}
 *   True if skipping this file.
 */
function skipFile(filename, stats) {
  if (!stats) {
    return true;
  }

  if (
    // The big stuff is all Human Genome Project data.
    stats.size > (24 * 1024 * 1024) ||
    // Some is identified by name.
    filename.match(/^\d+hgp\d+/)
  ) {
    return true;
  }

  return false;
}

/**
 * Return a list of all files in the provided directory and its subdirectories.
 *
 * @param {string} dir
 *   Absolute path to the directory.
 */
function listFiles(dir) {
  var filesUnderDir = [];
  var contents = fs.readdirSync(dir);

  _.each(contents, function(file) {
    var absFile = path.join(dir, file);
    var stats = fs.statSync(absFile);
    // Recurse into a directory.
    if (stats && stats.isDirectory()) {
      filesUnderDir.concat(listFiles(absFile));
    }
    // Or add a file to the growing list.
    else {
      if (!skipFile(file, stats)) {
        // Make sure the useful ones end up in front.
        if (_.contains(usefulFiles, file)) {
          filesUnderDir.unshift(absFile);
        } else {
          filesUnderDir.push(absFile);
        }
      }
    }
  });

  return filesUnderDir;
}

// The doctored file list with the usefulFiles up front and ready to run first.
var files = listFiles(filesDir);

// --------------------------------------------------------------------------
// Load files into the dictionary one by one.
// --------------------------------------------------------------------------

console.info(util.format('Processing %d files...', files.length));

var dictionary = {};

// Keep track of how many files have been processed.
var fileCount = 0;
// If any book after the this count has too high a fraction of new words then
// ignore it as not being English. Here we are assuming that the first book
// gives a good number of words - i.e. is a dictionary or similar.
var checkMaximumNovelWordsAfterFileCount = 1;
// Assume that the first file gives a decent spread of words. Thus any later
// file that adds too high a percentage of novel words is bad - not English.
var maximumNovelWordsFraction = 0.6;

async.eachSeries(files, function (file, asyncCallback) {
  fileCount++;

  console.log('-------------------------------------------');
  console.log(util.format('#%d : %s :', fileCount, file));

  var time = Date.now();
  // Number of unique words from this file.
  var uniqueWordCount = 0;
  // Number of these words not already in the dictionary.
  var novelWords = [];

  var readStream = fs.createReadStream(file);
  var dictionaryTransformStream = new fwp.util.DictionaryTransformStream({
    // We want string objects to result from the processing.
    objectMode: true,
    // These are the default settings: tokenize on whitespace and a few
    // punctuation marks and look for fairly ordinary words between 6 and 14
    // characters long.
    wordDelimiter: /[\s\.,!\?<>]+/,
    acceptanceRegExp: /^[a-z\-]{6,14}$/,
    rejectionRegExp: /-{2,}|-.*-/,
    // Each text is fairly modest in size, so little reason to manage memory by
    // allowing duplicates past.
    duplicateCacheSize: Infinity
  });

  // Set up a non-flowing mode listener.
  dictionaryTransformStream.on('readable', function () {
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
  });

  dictionaryTransformStream.on('finish', function () {

    console.log(util.format(
      'Complete in %dms : %d unique words : %d new words.',
      Date.now() - time,
      uniqueWordCount,
      novelWords.length
    ));

    // The check for non-English files that might have slipped through. Assume
    // that the first file gives a decent spread of words. Thus any later file
    // that adds too high a percentage of novel words is bad.
    if (fileCount > checkMaximumNovelWordsAfterFileCount) {
      if (novelWords.length / uniqueWordCount > maximumNovelWordsFraction) {
        console.log('Novel word fraction too high. Rejecting as non-English.');
        return asyncCallback();
      }
    }

    // Add the new words to the dictionary.
    _.each(novelWords, function (word) {
      dictionary[word] = true;
    });

    console.log(util.format('Dictionary now contains %d words.', _.size(dictionary)));

    readStream.unpipe();
    asyncCallback();
  });

  // Abort on error.
  dictionaryTransformStream.on('error', asyncCallback);

  // Start things running.
  readStream.pipe(dictionaryTransformStream);

}, function (error) {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  var dictionary = _.keys(dictionary).sort();

  console.log('-------------------------------------------');
  console.log(util.format('Final dictionary size: %s', dictionary.length));

  // TODO: a way of doing this that doesn't double the memory footprint.
  fs.writeFileSync(path.join(__dirname, 'dictionary.txt'), dictionary.join('\n') + '\n');
});

