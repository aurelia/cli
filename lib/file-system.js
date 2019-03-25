const fs = require('fs');
const nodePath = require('path');
const mkdirp = require('mkdirp');

exports.fs = fs;

/**
 * @deprecated
 *  fs.exists() is deprecated.
 *  See https://nodejs.org/api/fs.html#fs_fs_exists_path_callback.
 *  Functions using it can also not be properly tested.
 */
exports.exists = function(path) {
  return new Promise((resolve, reject) => fs.exists(path, resolve));
};

exports.stat = function(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (error, stats) => {
      if (error) reject(error);
      else resolve(stats);
    });
  });
};

exports.existsSync = function(path) {
  return fs.existsSync(path);
};

exports.mkdir = function(path) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, (error, result) => {
      if (error) reject(error);
      else resolve();
    });
  });
};

exports.mkdirp = function(path) {
  return new Promise((resolve, reject) => {
    mkdirp(path, error => {
      if (error) reject(error);
      else resolve();
    });
  });
};

exports.readdir = function(path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (error, files) => {
      if (error) reject(error);
      else resolve(files);
    });
  });
};

exports.appendFile = function(path, text, cb) {
  fs.appendFile(path, text, cb);
};

exports.readdirSync = function(path) {
  return fs.readdirSync(path);
};

exports.readFile = function(path, encoding) {
  if (encoding !== null) {
    encoding = encoding || 'utf8';
  }

  return new Promise((resolve, reject) => {
    fs.readFile(path, encoding, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
};

exports.readFileSync = fs.readFileSync;

exports.readFileSync = function(path, encoding) {
  if (encoding !== null) {
    encoding = encoding || 'utf8';
  }

  return fs.readFileSync(path, encoding);
};

exports.copySync = function(sourceFile, targetFile) {
  fs.writeFileSync(targetFile, fs.readFileSync(sourceFile));
};

exports.resolve = function(path) {
  return nodePath.resolve(path);
};

exports.join = function() {
  return nodePath.join.apply(this, Array.prototype.slice.call(arguments));
};

exports.statSync = function(path) {
  return fs.statSync(path);
};

exports.isFile = function(path) {
  try {
    return fs.statSync(path).isFile();
  } catch (err) {
    // ignore
    return false;
  }
};

exports.isDirectory = function(path) {
  try {
    return fs.statSync(path).isDirectory();
  } catch (err) {
    // ignore
    return false;
  }
};

exports.writeFile = function(path, content, encoding) {
  return new Promise((resolve, reject) => {
    mkdirp(nodePath.dirname(path), err => {
      if (err) reject(err);
      else {
        fs.writeFile(path, content, encoding || 'utf8', error => {
          if (error) reject(error);
          else resolve();
        });
      }
    });
  });
};
