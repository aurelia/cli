'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.init = init;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mkdirpPromise = require('../mkdirp-promise');

var _installer = require('../installer');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

/**
 * init
 * Create a directory at cwd/.aurelia, for creating plugins & storing templates
 * @param  {Object} config  Config passed from commands/init
 * @param  {Object} options Command Arguments
 * @return {Promise}        Resolved when all directories are made
 */

function init(options, answers) {

  var store = options.store;
  var aureliaDir = _path2['default'].join.bind(_path2['default'], process.cwd() + _path2['default'].sep + '.aurelia');

  var dirs = [aureliaDir('plugins'), aureliaDir('templates')];
  return store.init().then(function (response) {
    if (!options.env.modulePath) {
      return { msg: 'Local moduleFile not found, Please run $ npm install --save-dev aurelia-cli' };
    }
    if (!response.exists || answers.overwrite) {
      return store.create();
    }
    return response;
  });

  // if (options.create)
  //   return mkdirp(dirs)
  //     .then(function(){
  //       if (store) {
  //         return store.init({config:config});
  //       }
  //       return {msg:'Folders created in .aurelia/'};
  //     });
}