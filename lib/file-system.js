"use strict";
const fs = require('fs');
const nodePath = require('path');
const mkdirp = require('./mkdirp').mkdirp;

exports.exists = function(path) {
  return new Promise((resolve, reject) => fs.exists(path, resolve));
};

exports.mkdir = function(path) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, (error, result) => {
      if(error) reject(error);
      else resolve();
    });
  });
};

exports.mkdirp = function(path) {
  return new Promise((resolve, reject) => {
    mkdirp(path, error => {
      if(error) reject(error);
      else resolve();
    });
  });
}

exports.readdir = function(path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (error, files) => {
      if(error) reject(error);
      else resolve(files);
    });
  });
}

exports.readFile = function(path, encoding) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, encoding || 'utf8', (error, data) => {
      if(error) reject(error);
      else resolve(data);
    });
  });
};

exports.readFileSync = fs.readFileSync;

exports.readFileSync = function(path, encoding) {
  return fs.readFileSync(path, encoding || 'utf8');
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
}
