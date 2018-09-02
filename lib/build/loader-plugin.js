'use strict';

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
    contents = `define(\'${this.createModuleId(moduleId)}\',[],function(){return ${JSON.stringify(contents)};});`;
    return contents;
  }

  createModuleId(moduleId) {
    let loderConfigType = this.bundler.loaderOptions.type;

    switch (loderConfigType) {
    case 'require':
      return 'text!' + moduleId;
    case 'system':
      return moduleId + '!text';
    default:
      throw new Error(`Loader configuration style ${loderConfigType} is not supported.`);
    }
  }
};

function regExpFromExtensions(extensions) {
  return new RegExp('^.*(' + extensions.map(x => '\\' + x).join('|') + ')$');
}
