# Four Word Phrase

Four Word Phrase is a toolkit for the creation of short phrases by
pseudo-randomly picking words from a provided dictionary. When using a given
seed and dictionary the sequence of phrases generated is identical.

## Install via NPM

```
npm install four-word-phrase
```

## Example: Moby Dick

Generate a dictionary from the text of Moby Dick and use it to create
pseudo-random phrases:

```
var _ = require('underscore');
var async = require('async');
var fwp = require('four-word-phrase');
var mobyDick = fwp.example.mobyDick;

// Parse the book into a set of unique words and write that to a dictionary
// file.
var generateDictionary = mobyDick.generateDictionary;

// Use the dictionary file and seed to generate pseudo-random four word
// phrases.
var generatePhrases = function (callback) {
  var seed = 'a random seed';
  var phraseLength = 4;
  mobyDick.generatePhrases(seed, phraseLength, callback);
};

async.series([
  generateDictionary,
  generatePhrases
], function (error, results) {
  if (error) {
    return console.error(error);
  }
  var phrases = results[1];
  _.each(phrases, function (phrase) {
    console.info(phrase.join(' '));
  });
});

```

## Example: Project Gutenberg

Generating a dictionary from all of the English language text files served by
Project Gutenberg is a more ambitious undertaking, but readily accomplished.

Firstly download the files, an operation that will take 36 to 48 hours since it
is configured to put only a light load on the Project Gutenberg servers. The
process prints progress to the console. If prematurely ended it will pick up
where it left off when restarted.

As of Q2 2014 these files are ~7G zipped and ~21G unpacked, so make sure you
have at least 30G of disk space to spare for this process.

```
var fwp = require('four-word-phrase');
fwp.example.projectGutenberg.downloadFiles(function (error) {
  if (error) {
    console.error(error);
  }
});
```

Next, generate the dictionary. This again is a fairly intensive process and will
take the better part of a day on an average machine. It also keeps track of
progress and will pick up somewhere close to where it left off if restarted.

```
var fwp = require('four-word-phrase');
fwp.example.projectGutenberg.generateDictionary(function (error) {
  if (error) {
    console.error(error);
  }
});
```

Dictionary in hand, you can then generate phrases:

```
var _ = require('underscore');
var fwp = require('four-word-phrase');

var seed = 'a random seed';
var phraseLength = 4;
fwp.example.projectGutenberg.generatePhrases(seed, phraseLength, function (error, phrases) {
  if (error) {
    return console.error(error);
  }
  _.each(phrases, function (phrase) {
    console.info(phrase.join(' '));
  });
});
```

## Notes on Sufficient Uniqueness

UUIDs have a space of ~10e38 possible options, so there is a vanishing chance of
collision even if you generate a lot of them. Word sequences that are usefully
short (meaning short enough to memorize reliably) can't approach that. Four
words is probably the practical limit, and this has a far smaller space:

|                       | 3 words | 4 words | 10 words |
| --------------------- | ------- | ------- | -------- |
| Dictionary: 1,000     | ~10e9   | ~10e12  | ~10e30   |
| Dictionary: 10,000    | ~10e12  | ~10e16  | ~10e40   |
| Dictionary: 100,000   | ~10e15  | ~10e20  | ~10e50   |
| Dictionary: 1,000,000 | ~10e18  | ~10e24  | ~10e60   |

For reference, a dictionary generated from Moby Dick and restricted to words of
five to fourteen letters (including hyphens) has ~14,000 words. The English
language as a whole may have ~1,000,000 words, but far from all of those are
useful for this purpose. Sequences of short words are no easier to remember, but
are less secure as they can be more readily brute-forced.

## Creating a New Generator Implementation

To create a Generator with a different storage backend, subclass the base
`Generator` class and implement its undefined methods.

```
var util = require('util');
var Generator = require('four-word-phrase').generator.Generator

var MyGenerator = function (options) {
  MyGenerator.super_.call(this, options);

  // Setup here.

}
util.inherits(MyGenerator, Generator);

// Implement the necessary methods. e.g:
MyGenerator.prototype.appendWordsToDictionary = function (words, callback) {
  // ...
};
```
