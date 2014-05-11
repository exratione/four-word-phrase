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
var async = require('async');
var fs = require('fs');
var path = require('path');
var fwp = require('four-word-phrase');

var generator = new fwp.generator.MemoryGenerator({
  baseSeed: 'a random seed'
});

var filePath ='path/to/four-word-phrase/example/mobyDick/mobyDick.txt';
var readStream = fs.createReadStream(filePath);
var importer = new fwp.importer.ReadStreamImporter(generator);

importer.import({
  readStream: readStream
}, function (error) {
  if (error) {
    return console.error(error);
  }

  var phraseLength = 4;
  async.times(10, function (index, asyncCallback) {
    generator.nextPhrase(phraseLength, asyncCallback);
  }, function (error, phrases) {
    if (error) {
      return console.error(error);
    }
    phrases.forEach(function (phrase, index) {
      console.info('Phrase ' + (index + 1) + ': ' + phrase.join(' '));
    });
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

For reference, a dictionary generated from Moby Dick and restricted to words of
five to fourteen letters has ~14,000 words. The English language as a whole may
have ~1,000,000 words, but far from all of those are useful for this purpose.
Sequences of short words are no easier to remember, but are less secure as
they can be more readily brute-forced.

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
