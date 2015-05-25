import * as logger from '../logger';
import {defaults} from './defaults';

var extend   = require('lodash/object/extend');
var basename = require('path').basename;
var cli;


export class Config{

  constructor(env){
    cli = process.AURELIA;
    this.configName = basename(cli.env.configName);
    this.template = __dirname + `/template/${cli.env.configName}`;
    this._onready = [];
    this.isReady = false;
  }

  // Return the correct path to the configFile
  get configPath(){
    return cli.env.configPath;
  }

  // Return the current store Object
  get config(){
    return cli.settings.isAureliaFile
      ? cli.aurelia.configuration
      : defaults;
  }

  // Extend the current config
  set config(value){
    this._config = extend(this._config, value);
    cli.aurelia.configuration = this._config;
  }

  /**
   * init
   *
   * > Initialize the config store, creating a new AureliaFile if one does not exist
   *
   * @param  {Object} config Updates to the _config
   */
  init(config) {
    if (cli.env.configPath) {
      this._config = extend(this.config, config);
      logger.ok('Finished checking config file at [%s]', cli.env.configPath.cyan);
    } else {

      this._config = defaults();
      this._config = extend(this._config, config);
      this.write(this._config);
    }
  }

  /**
   * write
   *
   * > Write to the current configFile
   *
   * @param  {Object}   data  Updates to the _config
   * @param  {Function}  cb   callback function when complete
   * @return {Stream}         Return the vynl stream
   */
  write(data, cb) {

    var self     = this
      , vynl     = require('vinyl-fs')
      , compile  = require('gulp-template')
      , beautify = require('gulp-beautify')
    ;

    for(var key in data) {
      data[key] = JSON.stringify(data[key]);
    }
    vynl.src(this.template)
        .pipe(compile(data))
        .pipe(beautify({indentSize: 2}))
        .pipe(vynl.dest(cli.cwd()))
        .on('finish',function(){
          self._config = data;
          self.save();
          logger.ok('Finished creating config file at [%s]', cli.cwd().cyan);
        })
        .on('error', function(){
          logger.err('Issue creating config file at [%s]', cli.cwd().red);
        });
  }

  /**
   * set
   *
   * > Set properties on config to be saved.
   *
   * @param {String}   key   String || Object of new properties to add or Update config with
   * @param {value}   value  Object or value to apply to the key
   * @param {Function} cb    Callback to call when complete
   */
  set (key, value, cb) {

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

  /**
   * save
   * @param  {Object}   data Data to extend _config with
   * @param  {Function} cb   Callback to invoke when complete
   */
  save (data, cb) {
    return this.ready(function(){
      if (data) {
        this.config = data;
      }
      this.write(this.config);
    });
  }

  ready(cb) {
    if (this.isReady) {
      return cb.call(this);
    }
    this._onready.push(cb);
  }

  onReady () {
    this.isReady = true;
    this._onready.forEach(function(cb){
      cb.call(this);
    });

  }
}