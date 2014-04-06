/**
 * @fileOverview
 * Test a memory generator.
 */

var MemoryGenerator = require('../../src/generator/memoryGenerator');
var generalTests = require('../lib/generator');

var memoryGenerator = new MemoryGenerator({
  baseSeed: 'test'
});
generalTests('memoryGenerator', memoryGenerator);
