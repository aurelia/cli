import vinyl from 'vinyl-fs';
import template from 'gulp-template';

export class Store {

  constructor(config) {
    this.globalConfig = config;
    if (config.env.modulePath) {

      this.moduleFile = require(config.env.modulePath);
      if (config.env.configPath) {
        this.configFile = require(config.env.configPath);
      }
    }
    this.templateFile = __dirname + '/template/*.js';
  }

  get isConfig() {
    return !!this.configFile;
  }

  init() {
    var self = this;
    return new Promise(function(resolve, reject){
      if (self.isConfig)
        return resolve({exists:self.isConfig, msg:'Config Already Exists!'});
      else
        return resolve({exists:self.isConfig, msg:'Config Does not Exists!'});
    });
  }

  create() {
    var self = this;
    return new Promise(function(resolve, reject){
      vinyl.src(self.templateFile)
        .pipe(vinyl.dest(process.cwd()))
        .on('finish', function() {
          resolve({exists:self.isConfig, msg:'ConfigFile created!'});
        })
        .on('error', function() {
          reject({exists:self.isConfig, msg:'ConfigFile Not Created!'});
        });
    });
  }
}
