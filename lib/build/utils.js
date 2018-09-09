'use strict';
const path = require('path');
const crypto = require('crypto');
const fs = require('../file-system');

exports.knownExtensions = ['.js', '.json', '.css', '.svg', '.html'];

// require.resolve(packageName) cannot resolve package has no main.
// for instance: font-awesome v4.7.0
// manually try resolve paths
const PACKAGE_PATHS = require.resolve.paths('not-core/');

// resolve npm package path
exports.resolvePackagePath = function(packageName) {
  for (let i = 0, len = PACKAGE_PATHS.length; i < len; i++) {
    const dirname = path.join(PACKAGE_PATHS[i], packageName);
    let stat;
    try {
      stat = fs.statSync(dirname);
    } catch (e) {
      // ignore
    }

    if (stat && stat.isDirectory()) return dirname;
  }

  throw new Error(`cannot resolve npm package folder for "${packageName}"`);
};

exports.moduleIdWithPlugin = function(moduleId, pluginName, type) {
  switch (type) {
  case 'require':
    return pluginName + '!' + moduleId;
  case 'system':
    return moduleId + '!' + pluginName;
  default:
    throw new Error(`Loader configuration style ${type} is not supported.`);
  }
};

exports.generateBundleName = function(contents, fileName, rev) {
  let hash;
  if (rev === true) {
    hash = exports.generateHash(new Buffer(contents, 'utf-8'));
  } else {
    hash = rev;
  }
  return rev ? exports.generateHashedPath(fileName, hash) : fileName;
};

exports.runSequentially = function(tasks, cb) {
  let index = -1;
  let result = [];

  function exec() {
    index ++;

    if (index < tasks.length) {
      return cb(tasks[index]).then(r => result.push(r)).then(exec);
    }

    return Promise.resolve();
  }

  return exec().then(() => result);
};

exports.generateHashedPath = function(pth, hash) {
  if (arguments.length !== 2) {
    throw new Error('`path` and `hash` required');
  }

  return modifyFilename(pth, function(filename, ext) {
    return filename + '-' + hash + ext;
  });
};

exports.revertHashedPath = function(pth, hash) {
  if (arguments.length !== 2) {
    throw new Error('`path` and `hash` required');
  }

  return modifyFilename(pth, function(filename, ext) {
    return filename.replace(new RegExp('-' + hash + '$'), '') + ext;
  });
};

exports.generateHash = function(buf) {
  if (!Buffer.isBuffer(buf)) {
    throw new TypeError('Expected a buffer');
  }
  return crypto.createHash('md5').update(buf).digest('hex').slice(0, 10);
};

exports.escapeForRegex = function(str) {
  let matchers = /[|\\{}()[\]^$+*?.]/g;
  return str.replace(matchers, '\\$&');
};

exports.createSrcFileRegex = function() {
  let parts = Array.prototype.slice.call(arguments);
  let regexString = "\\b(?:src=(\"|')?(.*))(";
  for (let i = 0; i < parts.length; i ++) {
    regexString = regexString + exports.escapeForRegex(parts[i]) + (i < (parts.length - 1) ? '(\/|\\\\)' : '');
  }
  regexString = regexString + "(.*?).js)(?:(\"|')?)";
  return new RegExp(regexString);
};

function modifyFilename(pth, modifier) {
  if (arguments.length !== 2) {
    throw new Error('`path` and `modifier` required');
  }

  if (Array.isArray(pth)) {
    return pth.map(function(el) {
      return modifyFilename(el, modifier);
    });
  }

  let ext = path.extname(pth);
  return path.posix.join(path.dirname(pth), modifier(path.basename(pth, ext), ext));
}
