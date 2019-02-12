const path = require('path');
const fs = require('../file-system');
const Utils = require('./utils');

exports.DependencyDescription = class {
  constructor(name, source) {
    this.name = name;
    this.source = source;
  }

  get mainId() {
    return this.name + '/' + this.loaderConfig.main;
  }

  get banner() {
    const {metadata, name} = this;
    const version = (metadata && metadata.version) || '';
    return `package: ${version}${' '.repeat(version.length < 10 ? (10 - version.length) : 0)} ${name}`;
  }

  calculateMainPath(root) {
    let config = this.loaderConfig;
    let part = path.join(config.path, config.main);

    let ext = path.extname(part).toLowerCase();
    if (!ext || Utils.knownExtensions.indexOf(ext) === -1) {
      part = part + '.js';
    }

    return path.join(process.cwd(), root, part);
  }

  readMainFileSync(root) {
    let p = this.calculateMainPath(root);

    try {
      return fs.readFileSync(p).toString();
    } catch (e) {
      console.log('error', p);
      return '';
    }
  }

  // https://github.com/defunctzombie/package-browser-field-spec
  browserReplacement() {
    const browser = this.metadata && this.metadata.browser;
    // string browser field is handled in package-analyzer
    if (!browser || typeof browser === 'string') return;

    let replacement = {};

    for (let i = 0, keys = Object.keys(browser); i < keys.length; i++) {
      let key = keys[i];
      let target = browser[key];

      let sourceModule = filePathToModuleId(key);

      if (key.startsWith('.')) {
        sourceModule = './' + sourceModule;
      }

      if (typeof target === 'string') {
        let targetModule = filePathToModuleId(target);
        if (!targetModule.startsWith('.')) {
          targetModule = './' + targetModule;
        }
        replacement[sourceModule] = targetModule;
      } else {
        replacement[sourceModule] = false;
      }
    }

    return replacement;
  }
};

function filePathToModuleId(filePath) {
  let moduleId = path.normalize(filePath).replace(/\\/g, '/');

  if (moduleId.toLowerCase().endsWith('.js')) {
    moduleId = moduleId.slice(0, -3);
  }

  return moduleId;
}
