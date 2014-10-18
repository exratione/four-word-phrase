/**
 * @fileOverview
 * Functionality to test a dictionary.
 */

var async = require('async');
var expect = require('chai').expect;

/**
 * Run tests on the given dictionary instance.
 *
 * @param {string} description
 *   Description for the test.
 * @param {Dictionary} dictionary
 *   An initialized dictionary without any words added to its dictionary.
 */
module.exports = function (description, dictionary) {
  describe(description, function () {

    //----------------------------------------------------------------------
    // Add a few words, check the dictionary length.
    //----------------------------------------------------------------------

    describe('adding and getting words:', function () {
      var words = ['word-1', 'word-2', 'word-3'];

      it('dictionary length for empty dictionary', function (done) {
        dictionary.getLength(function (error, length) {
          expect(length).to.equal(0);
          done(error);
        });
      });

      it('add a word to the dictionary', function (done) {
        dictionary.appendWords(words[0], done);
      });

      it('dictionary length increments', function (done) {
        dictionary.getLength(function (error, length) {
          expect(length).to.equal(1);
          done(error);
        });
      });

      it('add a duplicate word to the dictionary', function (done) {
        dictionary.appendWords(words[0], done);
      });

      it('dictionary length remains the same', function (done) {
        dictionary.getLength(function (error, length) {
          expect(length).to.equal(1);
          done(error);
        });
      });

      it('add an array of two words to the dictionary', function (done) {
        dictionary.appendWords(words.slice(1), done);
      });

      it('dictionary length increments by two', function (done) {
        dictionary.getLength(function (error, length) {
          expect(length).to.equal(3);
          done(error);
        });
      });

      it('get added words', function (done) {
        async.map([0, 1, 2], function (index, asyncCallback) {
          dictionary.getWordAt(index, asyncCallback);
        }, function (error, results) {
          expect(results).to.deep.eql(words);
          done(error);
        });
      });

      it('get added words at once', function (done) {
        dictionary.getWordsAt([0, 1, 2], function (error, results) {
          expect(results).to.deep.eql(words);
          done(error);
        });
      });

      it('words are contained', function (done) {
        async.map(words, function (index, asyncCallback) {
          dictionary.containsWord(index, asyncCallback);
        }, function (error, results) {
          expect(results).to.deep.eql([true, true, true]);
          done(error);
        });
      });

      it('words are contained at once', function (done) {
        dictionary.containsWords(words, function (error, results) {
          expect(results).to.deep.eql([true, true, true]);
          done(error);
        });
      });

      it('words are not contained', function (done) {
        dictionary.containsWord('not-contained', function (error, results) {
          expect(results).to.deep.eql(false);
          done(error);
        });
      });

      it('words are not contained at once', function (done) {
        dictionary.containsWords([
          'not-contained-1',
          'not-contained-2'
        ], function (error, results) {
          expect(results).to.deep.eql([false, false]);
          done(error);
        });
      });
    });

  });
};
