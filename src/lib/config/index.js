
var exists = require('fs').existsSync;
var extend = require('lodash/object/extend')

var cli = process.AURELIA;
var logger = cli.import('lib/logger');

var defaults = {}
defaults.config = {
  "paths": {
    "*": "dist/*.js",
    "github:*": "jspm_packages/github/*.js",
    "npm:*": "jspm_packages/npm/*.js",
    "aurelia-skeleton-navigation/*": "lib/*.js"
  },
  "baseURL": '/Users/Shuhel/Workspace/aurelia/skeleton-navigation/'
}
defaults.bundle = {
  js: [{
    moduleExpression: 'aurelia-skeleton-navigation/*',
    fileName: 'nav-app-build.js',
    options: {
      inject: true
    }
  }, {
    moduleExpression: 'aurelia-bootstrapper',
    fileName: 'aurelia-framework-build.js',
    options: {
      inject: true
    }
  }],
  template: 'dist/*.html'
}

var _instance;
var Config = (function(){

  var _Config = function() {
    this.configName = 'Aureliafile.js';
    this.template = __dirname + '/template/Aureliafile.js';
    this._onready = [];
    this.isReady = false;
    var self = this;
  }

  _Config.prototype = {
    get configFile(){
      return process.cwd() + '/' + this.configName;
    },
    get config(){
      return cli.aurelia.configuration;
    },
    set config(value){
      this._config = extend(this._config, value);
      cli.aurelia.configuration = this._config;
    },

  }

  _Config.prototype.init = function(config) {
    if (config) {
      this._config = extend(this.config, config);
      logger.ok('Finished checking config file at [%s]', cli.env.configPath.cyan);
    } else {
      this._config = defaults;
      this.write(defaults);
    }
  }

  _Config.prototype.write = function(data, cb) {
    var self = this;
    var vynl = require('vinyl-fs')
       ,compile = require('gulp-template')
       ,beautify = require('gulp-beautify')
       ;

    for(var key in data) {
      data[key] = JSON.stringify(data[key]);
    }
    vynl.src(this.template)
        .pipe(compile(data))
        .pipe(beautify({indentSize: 2}))
        .pipe(vynl.dest(process.cwd()))
        .on('finish',function(){
          self._config = data;
          logger.ok('Finished creating config file at [%s]', cli.env.configPath.cyan);
        })
        .on('error', function(){
          logger.err('Issue creating config file at [%s]', cli.env.configPath.red);
        });
  }

  _Config.prototype.set = function(key, value, cb) {
    return this.ready(function(){

      if (typeof key === 'object') {
        value = key;
        key   = null;
      }

      key ? this._config[key] = value
          : this._config      = value;

      if (cb && typeof cb === 'function') {
        cb(this.config);
      }
    });
  }

  _Config.prototype.save = function(data, cb) {
    return this.ready(function(){
      if (data) {
        this.config = data;
      }
      this.write(this.config);
    });
  }

  _Config.prototype.ready = function(cb) {
    if (this.isReady) {
      return cb.call(this);
    }
    this._onready.push(cb);
  }

  _Config.prototype.onReady = function() {
    this.isReady = true;
    this._onready.forEach(function(cb){
      cb.call(this);
    });
  }

  if (!_instance) {
    _instance = new _Config();
  }
  return _instance;
})()

module.exports = Config;
