'use strict';

const logger = require('aurelia-logging').getLogger('StubNodejs');

// stub core Node.js modules based on https://github.com/webpack/node-libs-browser/blob/master/index.js
// no need stub for following modules, they got same name on npm package
//
// assert
// buffer
// events
// punycode
// process
// string_decoder
// url
// util (note: got small problem on ./support/isBuffer, read util package.json browser field)

// fail on following core modules has no stub
const UNAVAIABLE_CORE_MODULES = [
  'child_process',
  'cluster',
  'dgram',
  'dns',
  'fs',
  'net',
  'readline',
  'repl',
  'tls'
];

const EMPTY_MODULE = 'define(function(){});';

// note all paths here assumes local node_modules folder
// TODO use require.resolve to get correct node_modules folder. (to support yarn workspaces for instance)
module.exports = function(moduleId) {
  // with subfix -browserify
  if (['crypto', 'https', 'os', 'path', 'stream', 'timers', 'tty', 'vm'].indexOf(moduleId) !== -1) {
    return {name: moduleId, path: `../node_modules/${moduleId}-browserify`};
  }

  if (moduleId === 'domain') {
    logger.warn('core Node.js module "domain" is deprecated');
    return {name: 'domain', path: '../node_modules/domain-browser'};
  }

  if (moduleId === 'http') {
    return {name: 'http', path: '../node_modules/stream-http'};
  }

  if (moduleId === 'querystring') {
    // using querystring-es3 next version 1.0.0-0
    return {name: 'querystring', path: '../node_modules/querystring-es3'};
  }

  if (moduleId === 'sys') {
    logger.warn('core Node.js module "sys" is deprecated, the stub is disabled in CLI bundler due to conflicts with "util"');
  }

  if (moduleId === 'zlib') {
    return {name: 'zlib', path: '../node_modules/browserify-zlib'};
  }

  if (UNAVAIABLE_CORE_MODULES.indexOf(moduleId) !== -1) {
    logger.warn(`No avaiable stub for core Node.js module "${moduleId}", stubbed with empty module`);
    return EMPTY_MODULE;
  }
};

