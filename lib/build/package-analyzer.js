'use strict';
const fs = require('../file-system');
const path = require('path');
const DependencyDescription = require('./dependency-description').DependencyDescription;
const semver = require('semver');
const logger = require('aurelia-logging').getLogger('PackageAnalyzer');
const Utils = require('./utils');

exports.PackageAnalyzer = class {
  constructor(project) {
    this.project = project;
  }

  analyze(packageName) {
    let description = new DependencyDescription(packageName, 'npm');

    return loadPackageMetadata(this.project, description)
      .then(() => {
        if (!description.metadataLocation) {
          throw new Error(`Unable to find package metadata (package.json) of ${description.name}`);
        }
      })
      .then(() => determineLoaderConfig(this.project, description))
      .then(() => description);
  }

  reverseEngineer(loaderConfig) {
    loaderConfig = JSON.parse(JSON.stringify(loaderConfig));
    let description = new DependencyDescription(loaderConfig.name);
    description.loaderConfig = loaderConfig;

    if (!loaderConfig.packageRoot && (!loaderConfig.path || loaderConfig.path.indexOf('node_modules') !== -1)) {
      description.source = 'npm';
    } else {
      description.source = 'custom';
      if (!loaderConfig.packageRoot) {
        fillUpPackageRoot(this.project, description);
      }
    }

    return loadPackageMetadata(this.project, description)
      .then(() => {
        if (!loaderConfig.path) {
          // fillup main and path
          determineLoaderConfig(this.project, description);
        } else {
          if (!loaderConfig.main) {
            if (description.source === 'custom' && loaderConfig.path === loaderConfig.packageRoot) {
              // fillup main and path
              determineLoaderConfig(this.project, description);
            } else {
              const fullPath = path.resolve(this.project.paths.root, loaderConfig.path);
              if (fullPath === description.location) {
                // fillup main and path
                determineLoaderConfig(this.project, description);
                return;
              }

              // break single path into main and dir
              let pathParts = path.parse(fullPath);

              // when path is node_modules/package/foo/bar
              // set path to node_modules/package
              // set main to foo/bar
              loaderConfig.path = path.relative(this.project.paths.root, description.location).replace(/\\/g, '/');

              if (pathParts.dir.length > description.location.length + 1) {
                const main = path.join(pathParts.dir.substr(description.location.length + 1), removeJsExtension(pathParts.base));
                loaderConfig.main = main.replace(/\\/g, '/');
              } else if (pathParts.dir.length === description.location.length) {
                loaderConfig.main = removeJsExtension(pathParts.base).replace(/\\/g, '/');
              } else {
                throw new Error(`Path: "${loaderConfig.path}" is not in: ${description.location}`);
              }
            }
          } else {
            loaderConfig.main = removeJsExtension(loaderConfig.main).replace(/\\/g, '/');
          }
        }
      })
      .then(() => description);
  }
};

function fillUpPackageRoot(project, description) {
  let _path = description.loaderConfig.path;

  let ext = path.extname(_path).toLowerCase();
  if (!ext || Utils.knownExtensions.indexOf(ext) === -1) {
    // main file could be non-js file like css/font-awesome.css
    _path += '.js';
  }

  try {
    let stat = fs.statSync(path.resolve(project.paths.root, _path));
    if (stat.isFile()) {
      description.loaderConfig.packageRoot = path.dirname(description.loaderConfig.path).replace(/\\/g, '/');
    }
  } catch (e) {
    // _path is not a file
  }

  if (!description.loaderConfig.packageRoot) {
    description.loaderConfig.packageRoot = description.loaderConfig.path;
  }
}

function loadPackageMetadata(project, description) {
  return setLocation(project, description)
    .then(() => {
      if (description.metadataLocation) {
        return fs.readFile(description.metadataLocation).then(data => {
          description.metadata = JSON.parse(data.toString());
        });
      }
    })
    .catch(e => {
      logger.error(`Unable to load package metadata (package.json) of ${description.name}:`);
      logger.info(e);
    });
}

// loaderConfig.path is simplified when use didn't provide explicit config.
// In auto traced nodejs package, loaderConfig.path always matches description.location.
// We then use auto-generated moduleId aliases in dependency-inclusion to make AMD
// module system happy.
function determineLoaderConfig(project, description) {
  let metadata = description.metadata;
  let location = path.resolve(description.location);
  let metaMain;

  if (metadata) {
    // try 1.browser > 2.module > 3.main
    // the order is to target browser.
    // when aurelia-cli introduces multi-targets build,
    // it probably should use different order for electron app
    // for electron 1.module > 2.browser > 3.main
    if (typeof metadata.browser === 'string')  {
      // use package.json browser field if possible.
      metaMain = metadata.browser;
    } else if (typeof metadata.module === 'string' && !description.name.startsWith('aurelia-')) {
      // prefer es module format over cjs, just like webpack.
      // this improves compatibility with TypeScript.
      metaMain = metadata.module;
    } else if (typeof metadata.main === 'string') {
      metaMain = metadata.main;
    }
  }

  let mainFile = metaMain || 'index';

  try {
    // metaMain could be './lib', the real main file is './lib/index.js'
    let metaMainStat = fs.statSync(path.join(location, mainFile));
    if (metaMainStat.isDirectory()) {
      mainFile += '/index.js';
    }
  } catch (e) {
    //
  }

  let ext = path.extname(mainFile).toLowerCase();
  if (!ext || Utils.knownExtensions.indexOf(ext) === -1) {
    // main file could be non-js file like css/font-awesome.css
    mainFile += '.js';
  }

  if (mainFile.startsWith('./')) mainFile = mainFile.substr(2);

  // https://github.com/aurelia/loader-default/issues/47
  // Because of bug in commonjs build, enforce using amd build.
  // The bug is fixed in 1.0.4
  if (description.name === 'aurelia-loader-default' &&
      semver.lt(metadata.version, '1.0.4')) {
    mainFile = mainFile.replace('dist/commonjs', 'dist/amd');
  }

  let sourcePath = path.join(location, mainFile);
  let mainExists = fs.existsSync(sourcePath);

  if (!metaMain && !mainExists) {
    // package like font-awesome has no main and doesn't have default index.js
    logger.warn(`The "${description.name}" package has no main file and default main: index.js doesn't exist`);
  }

  if (!metaMain || mainExists) {
    if (!description.loaderConfig) {
      description.loaderConfig = {name: description.name};
    }

    description.loaderConfig.path = path.relative(project.paths.root, description.location).replace(/\\/g, '/');
    description.loaderConfig.main = removeJsExtension(mainFile);
  } else {
    throw new Error(`The "${description.name}" package references a main file that does not exist: ${sourcePath}`);
  }
}

function setLocation(project, description) {
  switch (description.source) {
  case 'npm':
    return getPackageFolder(project, description)
      .then(packageFolder => {
        description.location = packageFolder;

        return tryFindMetadata(project, description);
      });
  case 'custom':
    description.location = path.resolve(project.paths.root, description.loaderConfig.packageRoot);

    return tryFindMetadata(project, description);
  default:
    return Promise.reject(`The package source "${description.source}" is not supported.`);
  }
}

function tryFindMetadata(project, description) {
  return fs.stat(path.join(description.location, 'package.json'))
    .then(() => description.metadataLocation = path.join(description.location, 'package.json'))
    .catch(() => {});
}

function getPackageFolder(project, description) {
  if (!description.loaderConfig || !description.loaderConfig.path) {
    return new Promise(resolve => {
      resolve(Utils.resolvePackagePath(description.name));
    });
  }

  return lookupPackageFolderRelativeStrategy(project.paths.root, description.loaderConfig.path);
}

// Looks for the node_modules folder from the root path of aurelia
// with the defined loaderConfig.
function lookupPackageFolderRelativeStrategy(root, relativePath) {
  let pathParts = relativePath.replace(/\\/g, '/').split('/');
  let packageFolder = '';
  let stopOnNext = false;

  for (let i = 0; i < pathParts.length; ++i) {
    let part = pathParts[i];

    packageFolder = path.join(packageFolder, part);

    if (stopOnNext && !part.startsWith('@')) {
      break;
    } else if (part === 'node_modules') {
      stopOnNext = true;
    }
  }

  return Promise.resolve(path.resolve(root, packageFolder));
}

function removeJsExtension(filePath) {
  let ext = path.extname(filePath);

  if (ext.toLowerCase() === '.js') {
    return filePath.substr(0, filePath.length - ext.length);
  }

  return filePath;
}
