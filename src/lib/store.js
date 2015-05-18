var _f     = require('fs-utils'),
  exists = require('fs').existsSync,
  extend = require('lodash/object/extend'),
  path   = require('path');

var write = _f.writeJSONSync,
  read  = _f.readJSONSync;

var cli = process.AURELIA;
var _instance;

var Store = (function(){

  function _Store(configPath) {
    configPath = configPath || process.env.PWD;
    this.configName = '.aurelia-config.json'
    this.configPath = configPath +'/'+this.configName;
    this.configRoot = path.join.bind(path, process.cwd());
    this.defaultConfig = exists(this.configPath)
      ? read(this.configPath)
      : {
        paths: {
          root: this.configRoot(),
          plugins: this.configRoot('plugins'),
          templates: this.configRoot('templates'),
          project: this.configRoot('project')
        }
        };
  }

  _Store.prototype = {
    get config(){
      if (!this._config) {
        this._config = this.sync();
      }
      return this._config;
    },

    set config(config){
      this._config = config;
    },

    init: function() {
      write(this.configPath, this.defaultConfig);
      return this.sync();
    },

    sync: function() {
      if (exists(this.configPath)) {
        this.config = read(this.configPath);
        return this._config;
      } else {
        return this.init();
      }
    },

    set: function(key, value) {
      if (typeof key === 'object') {
        value = key;
        key   = null;
      }
      if (key) {
        this._config[key] = value;
      } else {
        extend(this._config, value);
      }
    },

    save: function(data) {
      data = data || this._config;
      extend(this._config, data);
      write(this.configPath, this._config);
      this._config = this._config;
    },
  };

  return {
    getInstance: function(dir) {
      if (!_instance) {
        _instance = new _Store(dir);
      }
      return _instance;
    }
  }

})();


module.exports = Store;
