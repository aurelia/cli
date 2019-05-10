const {moduleIdWithPlugin} = require('./utils');

exports.LoaderPlugin = class {
  constructor(type, config) {
    this.type = type;
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
    // for backward compatibility, use 'text' as plugin name,
    // to not break existing app with additional json plugin in aurelia.json
    return moduleIdWithPlugin(moduleId, 'text', this.type);
  }
};

function regExpFromExtensions(extensions) {
  return new RegExp('^.*(' + extensions.map(x => '\\' + x).join('|') + ')$');
}

