var wdioConf = require('./wdio.conf.js');

wdioConf.config.specs = [
  './test/e2e/acceptance/**/*.test.ts'
];

exports.config = wdioConf.config;
