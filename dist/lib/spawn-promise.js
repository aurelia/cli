'use strict';

var Promise = require('bluebird');
var spawn = require('child_process').spawn;
var logger = require('./logger');

function SpawnPromise(options) {
  if (Array.isArray(options)) {
    return multiSpawn(options);
  }

  if (!options) {
    logger.err('spawn Requires an options parameter!');
  }
  if (!options.command) {
    logger.err('spawn requires a command property on options ');
  }

  if (options.args && !Array.isArray(options.args)) {
    logger.err('options.args must be an array');
  }

  return new Promise(function (resolve, reject) {

    var child_process = spawn(options.command, options.args);

    child_process.stdout.on('data', function (data) {
      resolve('' + data);
      process.stdout.write('' + data);
    });

    child_process.stderr.on('data', function (data) {
      if (options.command !== 'git') {
        reject('' + data);
      } else {
        resolve('' + data);
      }
      process.stdout.write('' + data);
    });

    child_process.on('close', function (code) {});
  });
}

function multiSpawn(options) {
  return new Promise(function (resolve, reject) {
    var index = 0;
    var dataArray = '';
    var next = function next() {
      SpawnPromise(options[index]).then(function (data) {
        dataArray += data;
        index++;
        if (options[index]) {
          return next();
        } else {
          resolve(dataArray);
        }
      });
    };
    next();
  });
}

module.exports = SpawnPromise;