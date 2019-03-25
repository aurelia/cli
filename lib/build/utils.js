const path = require('path');
const crypto = require('crypto');
const fs = require('../file-system');
const tmpDir = require('os').tmpdir();

exports.knownExtensions = ['.js', '.json', '.css', '.svg', '.html'];

exports.couldMissGulpPreprocess = function(id) {
  const ext = path.extname(id).toLowerCase();
  return ext && ext !== '.js' && ext !== '.html' && ext !== '.css';
};

// require.resolve(packageName) cannot resolve package has no main.
// for instance: font-awesome v4.7.0
// manually try resolve paths
const PACKAGE_PATHS = [
  // normal search from cli
  ...require.resolve.paths('not-core/'),
  // additional search from app's folder, this is necessary to support
  // lerna hoisting where cli is out of app's local node_modules folder.
  ...require('resolve/lib/node-modules-paths')(process.cwd(), {})
];

// resolve npm package path
exports.resolvePackagePath = function(packageName) {
  for (let i = 0, len = PACKAGE_PATHS.length; i < len; i++) {
    const dirname = path.join(PACKAGE_PATHS[i], packageName);
    if (fs.isDirectory(dirname)) return dirname;
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

const CACHE_DIR = path.resolve(tmpDir, 'aurelia-cli-cache');
exports.cacheDir = CACHE_DIR;

function cachedFilePath(hash) {
  const folder = hash.slice(0, 2);
  const fileName = hash.slice(2);
  return path.resolve(CACHE_DIR, folder, fileName);
}

exports.getCache = function(hash) {
  const filePath = cachedFilePath(hash);
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (e) {
    // ignore
  }
};

exports.setCache = function(hash, object) {
  const filePath = cachedFilePath(hash);
  // async write
  fs.writeFile(filePath, JSON.stringify(object));
};

exports.runSequentially = function(tasks, cb) {
  let index = -1;
  let result = [];

  function exec() {
    index ++;

    if (index < tasks.length) {
      return cb(tasks[index], index).then(r => result.push(r)).then(exec);
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

exports.generateHash = function(bufOrStr) {
  return crypto.createHash('md5').update(bufOrStr).digest('hex');
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

// https://nodejs.org/dist/latest-v10.x/docs/api/modules.html
// after "high-level algorithm in pseudocode of what require.resolve() does"
function nodejsLoadAsFile(resourcePath) {
  if (fs.isFile(resourcePath)) {
    return resourcePath;
  }

  if (fs.isFile(resourcePath + '.js')) {
    return resourcePath + '.js';
  }

  if (fs.isFile(resourcePath + '.json')) {
    return resourcePath + '.json';
  }
  // skip .node file that nobody uses
}

function nodejsLoadIndex(resourcePath) {
  if (!fs.isDirectory(resourcePath)) return;

  const indexJs = path.join(resourcePath, 'index.js');
  if (fs.isFile(indexJs)) {
    return indexJs;
  }

  const indexJson = path.join(resourcePath, 'index.json');
  if (fs.isFile(indexJson)) {
    return indexJson;
  }
  // skip index.node file that nobody uses
}

function nodejsLoadAsDirectory(resourcePath) {
  if (!fs.isDirectory(resourcePath)) return;

  const packageJson = path.join(resourcePath, 'package.json');

  if (fs.isFile(packageJson)) {
    let metadata;
    try {
      metadata = JSON.parse(fs.readFileSync(packageJson));
    } catch (err) {
      console.error(err);
      return;
    }
    let metaMain;
    // try 1.browser > 2.module > 3.main
    // the order is to target browser.
    // when aurelia-cli introduces multi-targets build,
    // it probably should use different order for electron app
    // for electron 1.module > 2.browser > 3.main
    if (typeof metadata.browser === 'string')  {
      // use package.json browser field if possible.
      metaMain = metadata.browser;
    } else if (typeof metadata.module === 'string' &&
      !(metadata.name && metadata.name.startsWith('aurelia-'))) {
      // prefer es module format over cjs, just like webpack.
      // this improves compatibility with TypeScript.
      // ignores aurelia-* core npm packages as their module
      // field is pointing to es2015 folder.
      metaMain = metadata.module;
    } else if (typeof metadata.main === 'string') {
      metaMain = metadata.main;
    }

    let mainFile = metaMain || 'index';
    const mainResourcePath = path.resolve(resourcePath, mainFile);
    return nodejsLoadAsFile(mainResourcePath) || nodejsLoadIndex(mainResourcePath);
  }

  return nodejsLoadIndex(resourcePath);
}

exports.nodejsLoad = function(resourcePath) {
  return nodejsLoadAsFile(resourcePath) || nodejsLoadAsDirectory(resourcePath);
};

exports.removeJsExtension = function(filePath) {
  if (path.extname(filePath).toLowerCase() === '.js') {
    return filePath.slice(0, -3);
  }

  return filePath;
};

