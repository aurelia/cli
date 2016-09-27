"use strict";
const path = require('path');

exports.LoaderPlugin = class {
  constructor(bundler, config) {
    this.bundler = bundler;
    this.config = config;
    this.name = config.name;
    this.stub = config.stub;
    this.test = config.test ? new RegExp(config.test) : regExpFromExtensions(config.extensions);
  }

  matches(filePath) {
    return this.test.test(filePath);
  }

  transform(moduleId, filePath, contents) {
    contents = `define(\'${this.createModuleId(moduleId, filePath)}\', [\'module\'], function(module) { module.exports = "` +
      contents
        .replace(/(["\\])/g, '\\$1')
        .replace(/[\f]/g, '\\f')
        .replace(/[\b]/g, '\\b')
        .replace(/[\n]/g, '\\n')
        .replace(/[\t]/g, '\\t')
        .replace(/[\r]/g, '\\r')
        .replace(/[\u2028]/g, '\\u2028')
        .replace(/[\u2029]/g, '\\u2029') +
      '"; });';

    return Promise.resolve(contents);
  }

  createModuleId(moduleId, filePath) {
    let loderConfigType = this.bundler.loaderOptions.type;

    switch(loderConfigType) {
      case 'require':
        return 'text!' + moduleId + path.extname(filePath);
      case 'system':
        throw new Error('SystemJS is not yet supported');
      default:
        throw new Error(`Loader configuration style ${loderConfigType} is not supported.`);
    }
  }
}

function regExpFromExtensions(extensions) {
  return new RegExp('^.*(' + extensions.map(x => '\\' + x).join('|') + ')$');
}
