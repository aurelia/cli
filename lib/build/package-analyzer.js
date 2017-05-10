'use strict';
const fs = require('../file-system');
const path = require('path');
const DependencyDescription = require('./dependency-description').DependencyDescription;

exports.PackageAnalyzer = class {
  constructor(project) {
    this.project = project;
  }

  analyze(packageName, packageSource) {
    let description = new DependencyDescription(packageName, packageSource || 'npm');

    return loadPackageMetadata(this.project, description)
      .then(() => determineLoaderConfig(this.project, description))
      .then(() => description);
  }

  reverseEngineer(loaderConfig) {
    let description = new DependencyDescription(loaderConfig.name);

    if (loaderConfig.path.indexOf('node_modules') !== -1) {
      description.loaderConfig = loaderConfig;
      description.source = 'npm';
      return loadPackageMetadata(this.project, description).then(() => description);
    }

    description.source = 'custom';
    description.loaderConfig = loaderConfig;

    return loadPackageMetadata(this.project, description).then(() => description);
  }
};

function loadPackageMetadata(project, description) {
  return setLocation(project, description)
    .then(() => {
      if (description.metadataLocation) {
        return fs.readFile(description.metadataLocation)
        .then(data => {
          description.metadata = JSON.parse(data.toString());
        });
      }
    })
    .catch(e => {
      console.log(`Unable to load package metadata (package.json) of ${description.name}:`);
      console.log(e);
    });
}

function determineLoaderConfig(project, description) {
  let metadata = description.metadata;
  let location = path.resolve(description.location);
  let sourcePath;

  if (metadata) {
    if (metadata.jspm) {
      let jspm = metadata.jspm;

      if (jspm.directories && jspm.directories.dist) {
        sourcePath = path.join(location, jspm.directories.dist, jspm.main);
      } else {
        sourcePath = path.join(location, metadata.main);
      }
    } else {
      sourcePath = path.join(location, metadata.main || 'index');
    }
  } else {
    sourcePath = path.join(location, 'index');
  }

  sourcePath = sourcePath.endsWith('.js') ? sourcePath : sourcePath + '.js';

  if (fs.existsSync(sourcePath)) {
    sourcePath = path.relative(path.resolve(project.paths.root), sourcePath);

    description.loaderConfig = {
      name: description.name,
      path: removeExtension(sourcePath)
    };
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
    if (!description.loaderConfig || !description.loaderConfig.packageRoot) {
      return Promise.reject(`Error: packageRoot property not defined for the "${description.name}" package. It is recommended to ` +
      'define the packageRoot for packages outside the node_modules folder, so that the files end up in' +
      'the correct bundle');
    }

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
    return lookupPackageFolderDefaultStrategy(project.paths.root)
      .catch(error => { throw new Error('A valid package source could not be found.'); })
      .then(packageFolder => path.join(packageFolder, description.name));
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

// Looks for a node_modules folder from the root path of aurelia
// With the default lookup strategy of node
function lookupPackageFolderDefaultStrategy(root) {
  // Test for root directory
  if (/^\/$|^[A-Z]:\/*$/g.test(root)) return Promise.reject();
  return fs.readdir(root)
    .then(files => {
      let matches = files.filter(file => file === 'node_modules');

      // Just choose first entry. There shouldnt be more of them in one folder
      if (matches.length) {
        let cwdToRoot = path.resolve(process.cwd(), root);
        return path.join(cwdToRoot, matches[0]);
      }

      return lookupPackageFolderDefaultStrategy(path.resolve(root, '..'));
    });
}

function removeExtension(filePath) {
  let ext = path.extname(filePath);

  if (ext) {
    return filePath.replace(ext, '');
  }

  return filePath;
}
