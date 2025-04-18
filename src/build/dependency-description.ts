import * as path from 'node:path';
import * as fs from '../file-system';
import * as Utils from './utils';

export class DependencyDescription {
  public name: string;
  public source: string | undefined;

  public location: string | undefined;
  public loaderConfig: ILoaderConfig | undefined;
  public metadata: { version: string, browser: string } | undefined;
  public metadataLocation: string | undefined;

  constructor(name: string, source?: string) {
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

  calculateMainPath(root: string) {
    const config = this.loaderConfig;
    let part = path.join(config.path, config.main);

    const ext = path.extname(part).toLowerCase();
    if (!ext || Utils.knownExtensions.indexOf(ext) === -1) {
      part = part + '.js';
    }

    return path.join(process.cwd(), root, part);
  }

  readMainFileSync(root: string) {
    const p = this.calculateMainPath(root);

    try {
      return fs.readFileSync(p).toString();
    } catch {
      console.log('error', p);
      return '';
    }
  }

  // https://github.com/defunctzombie/package-browser-field-spec
  browserReplacement() {
    const browser = this.metadata && this.metadata.browser;
    // string browser field is handled in package-analyzer
    if (!browser || typeof browser === 'string') return;

    const replacement = {};

    for (let i = 0, keys = Object.keys(browser); i < keys.length; i++) {
      const key = keys[i];
      // leave {".": "dist/index.js"} for main replacement
      if (key === '.') continue;
      const target = browser[key];

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

function filePathToModuleId(filePath: string) {
  let moduleId = path.normalize(filePath).replace(/\\/g, '/');

  if (moduleId.toLowerCase().endsWith('.js')) {
    moduleId = moduleId.slice(0, -3);
  }

  return moduleId;
}
