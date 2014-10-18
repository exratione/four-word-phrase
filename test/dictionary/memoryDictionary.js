/**
 * @fileOverview
 * Test a memory dictionary.
 */

var MemoryDictionary = require('../../src/dictionary/memoryDictionary');
var dictionaryTests = require('../lib/dictionary');

var memoryDictionary = new MemoryDictionary();
dictionaryTests('memoryDictionary:', memoryDictionary);
