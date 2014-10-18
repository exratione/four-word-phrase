/**
 * @fileOverview
 * Test a memory generator.
 */

var MemoryDictionary = require('../../src/dictionary/memoryDictionary');
var MemoryGenerator = require('../../src/generator/memoryGenerator');
var dictionaryTests = require('../lib/dictionary');
var generatorTests = require('../lib/generator');

var memoryDictionary = new MemoryDictionary();
var memoryGenerator = new MemoryGenerator(memoryDictionary, {
  baseSeed: 'test'
});

// Run the dictionary tests first to populate the dictionary with known data.
dictionaryTests('memoryDictionary:', memoryDictionary);
generatorTests('memoryGenerator:', memoryGenerator);
