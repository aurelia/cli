'use strict';

var fs = require('fs'),
    path = require('path'),
    Promise = require('bluebird'),
    map = require('lodash/collection/map'),
    cli = process.AURELIA,
    mkdirp = require('mkdirp');

var logger = cli['import']('lib/logger');

function mkdir(dirs, initialDirs) {
  if (Array.isArray(dirs)) {
    return Promise.all(map(dirs, function (dir) {
      return mkdir(dir);
    })).then(function () {
      return { message: 'Finished creating directories' };
    });
  }
  return new Promise(function (resolve, reject) {
    mkdirp(dirs);
    resolve({ message: 'Finished creating directories' });
  });
}
module.exports = mkdir;