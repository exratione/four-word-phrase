/**
 * @fileOverview
 * Functionality to test a generator.
 */

var async = require('async');
var expect = require('chai').expect;

/**
 * Run tests on the given generator instance.
 *
 * @param {string} description
 *   Description for the test.
 * @param {Generator} generator
 *   An initialized generator without any words added to its dictionary.
 */
module.exports = function (description, generator) {
  describe(description, function () {

    //----------------------------------------------------------------------
    // Check the PRNG.
    //----------------------------------------------------------------------

    describe('pseudo-random number generator', function () {

      it('invalid count for PRNG', function (done) {
        generator.getPhrasePrngFunction('not an integer', function (error, prng) {
          expect(error).to.be.an.instanceof(Error);
          expect(prng).to.equal(undefined);
          done();
        });
      });

      it('number generation works as expected', function (done) {
        // A and B should be the same. C is different.
        var prngA, resultsA = [];
        var prngB, resultsB = [];
        var prngC, resultsC = [];

        async.series({
          prngA: function (asyncCallback) {
            generator.getPhrasePrngFunction(1, function (error, prng) {
              prngA = prng;
              asyncCallback(error);
            });
          },
          prngB: function (asyncCallback) {
            generator.getPhrasePrngFunction(1, function (error, prng) {
              prngB = prng;
              asyncCallback(error);
            });
          },
          prngC: function (asyncCallback) {
            generator.getPhrasePrngFunction(2, function (error, prng) {
              prngC = prng;
              asyncCallback(error);
            });
          }
        }, function (error) {
          if (error) {
            return done(error);
          }

          for (var index = 0; index < 10; index++) {
            resultsA[index] = prngA();
            resultsB[index] = prngB();
            resultsC[index] = prngC();
          }

          expect(resultsA).to.deep.equal(resultsB);
          expect(resultsA).to.not.deep.equal(resultsC);
          done();
        });
      });

    });

    //----------------------------------------------------------------------
    // Add a few words, check the dictionary length.
    //----------------------------------------------------------------------

    describe('adding and getting words', function () {
      var words = ['word-1', 'word-2', 'word-3'];

      it('dictionary length for empty dictionary', function (done) {
        generator.getDictionaryLength(function (error, length) {
          expect(length).to.equal(0);
          done(error);
        });
      });

      it('add a word to the dictionary', function (done) {
        generator.appendWordsToDictionary(words[0], done);
      });

      it('dictionary length increments', function (done) {
        generator.getDictionaryLength(function (error, length) {
          expect(length).to.equal(1);
          done(error);
        });
      });

      it('add a duplicate word to the dictionary', function (done) {
        generator.appendWordsToDictionary(words[0], done);
      });

      it('dictionary length remains the same', function (done) {
        generator.getDictionaryLength(function (error, length) {
          expect(length).to.equal(1);
          done(error);
        });
      });

      it('add an array of two words to the dictionary', function (done) {
        generator.appendWordsToDictionary(words.slice(1), done);
      });

      it('dictionary length increments by two', function (done) {
        generator.getDictionaryLength(function (error, length) {
          expect(length).to.equal(3);
          done(error);
        });
      });

      it('get added words', function (done) {
        async.map([0, 1, 2], function (index, asyncCallback) {
          generator.getWord(index, asyncCallback);
        }, function (error, results) {
          expect(results).to.deep.eql(words);
          done(error);
        });
      });

    });

    //----------------------------------------------------------------------
    // Check the count functions.
    //----------------------------------------------------------------------

    describe('phrase count', function () {

      it('count is initially 0', function (done) {
        generator.getCount(function (error, count) {
          expect(count).to.equal(0);
          done(error);
        });
      });

      it('increment count', function (done) {
        generator.incrementCount(function (error, count) {
          expect(count).to.equal(1);
          done(error);
        });
      });

      it('count is incremented', function (done) {
        generator.getCount(function (error, count) {
          expect(count).to.equal(1);
          done(error);
        });
      });

      it('set count to 0', function (done) {
        generator.setCount(0, done);
      });

      it('count is set to 0', function (done) {
        generator.getCount(function (error, count) {
          expect(count).to.equal(0);
          done(error);
        });
      });

    });

    //----------------------------------------------------------------------
    // Phrase generation.
    //----------------------------------------------------------------------

    describe('phrase generation', function () {

      it('generate four word phrase', function (done) {
        generator.nextPhrase(4, function(error, words) {
          expect(words.length).to.equal(4);
          words.forEach(function (word) {
            expect(typeof word).to.equal('string');
          });
          done(error);
        });
      });

    });

  });
};
