module.exports = {
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
  }
};
