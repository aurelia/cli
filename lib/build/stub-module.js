const path = require('path');
const Utils = require('./utils');
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
// util

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

function resolvePath(packageName, root) {
  return path.relative(root, Utils.resolvePackagePath(packageName)).replace(/\\/g, '/');
}

// note all paths here assumes local node_modules folder
module.exports = function(moduleId, root) {
  // with subfix -browserify
  if (['crypto', 'https', 'os', 'path', 'stream', 'timers', 'tty', 'vm'].indexOf(moduleId) !== -1) {
    return {name: moduleId, path: resolvePath(`${moduleId}-browserify`, root)};
  }

  if (moduleId === 'domain') {
    logger.warn('core Node.js module "domain" is deprecated');
    return {name: 'domain', path: resolvePath('domain-browser', root)};
  }

  if (moduleId === 'http') {
    return {name: 'http', path: resolvePath('stream-http', root)};
  }

  if (moduleId === 'querystring') {
    // using querystring-es3 next version 1.0.0-0
    return {name: 'querystring', path: resolvePath('querystring-es3', root)};
  }

  if (moduleId === 'sys') {
    logger.warn('core Node.js module "sys" is deprecated, the stub is disabled in CLI bundler due to conflicts with "util"');
  }

  if (moduleId === 'zlib') {
    return {name: 'zlib', path: resolvePath('browserify-zlib', root)};
  }

  if (UNAVAIABLE_CORE_MODULES.indexOf(moduleId) !== -1) {
    logger.warn(`No avaiable stub for core Node.js module "${moduleId}", stubbed with empty module`);
    return EMPTY_MODULE;
  }

  // https://github.com/defunctzombie/package-browser-field-spec
  // {"module-a": false}
  // replace with special placeholder __ignore__
  if (moduleId === '__ignore__') {
    return EMPTY_MODULE;
  }

  if (moduleId === '__inject_css__') {
    return {
      name: '__inject_css__',
      path: resolvePath('aurelia-cli', root),
      main: 'lib/build/inject-css'
    };
  }
};

