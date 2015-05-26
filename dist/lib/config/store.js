'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _vinylFs = require('vinyl-fs');

var _vinylFs2 = _interopRequireDefault(_vinylFs);

var _gulpTemplate = require('gulp-template');

var _gulpTemplate2 = _interopRequireDefault(_gulpTemplate);

var Store = (function () {
  function Store(config) {
    _classCallCheck(this, Store);

    this.globalConfig = config;
    if (config.env.modulePath) {

      this.moduleFile = require(config.env.modulePath);
      if (config.env.configPath) {
        this.configFile = require(config.env.configPath);
      }
    }
    this.templateFile = __dirname + '/template/*.js';
  }

  _createClass(Store, [{
    key: 'isConfig',
    get: function () {
      return !!this.configFile;
    }
  }, {
    key: 'init',
    value: function init() {
      var self = this;
      return new Promise(function (resolve, reject) {
        if (self.isConfig) return resolve({ exists: self.isConfig, msg: 'Config Already Exists!' });else return resolve({ exists: self.isConfig, msg: 'Config Does not Exists!' });
      });
    }
  }, {
    key: 'create',
    value: function create() {
      var self = this;
      return new Promise(function (resolve, reject) {
        _vinylFs2['default'].src(self.templateFile).pipe(_vinylFs2['default'].dest(process.cwd())).on('finish', function () {
          resolve({ exists: self.isConfig, msg: 'ConfigFile created!' });
        }).on('error', function () {
          reject({ exists: self.isConfig, msg: 'ConfigFile Not Created!' });
        });
      });
    }
  }]);

  return Store;
})();

exports.Store = Store;