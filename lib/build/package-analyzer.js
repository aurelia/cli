"use strict";
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

    return Promise.resolve(description);
  }
}

function loadPackageMetadata(project, description) {
  setLocation(project, description);

  return fs.readFile(description.metadataLocation).then(data => {
    description.metadata = JSON.parse(data.toString());
  });
}

function determineLoaderConfig(project, description) {
  let metadata = description.metadata;
  let location = description.location;
  let sourcePath;

  if (metadata.jspm) {
    let jspm = metadata.jspm;

    if (jspm.directories && jspm.directories.dist) {
      sourcePath = '../' + path.join(location, jspm.directories.dist, jspm.main);
    } else {
      sourcePath = '../' + path.join(location, metadata.main);
    }
  } else {
    sourcePath = '../' + path.join(location, metadata.main);
  }

  description.loaderConfig = {
    name: description.name,
    path: removeExtension(sourcePath)
  };
}

function setLocation(project, description) {
  switch (description.source) {
    case 'npm':
      description.location = getPackageFolder(description);
      description.metadataLocation = path.join(description.location, 'package.json');
      break;
    default:
      throw new Error(`The package source "${description.source}" is not supported.`);
  }
}

function getPackageFolder(description) {
  if (!description.loaderConfig || !description.loaderConfig.path) {
    return path.join('node_modules', description.name);
  }

  let pathParts = description.loaderConfig.path.replace(/\\/g, '/').split('/');
  let packageFolder = '';
  let stopOnNext = false;

  for(let i = 0; i < pathParts.length; ++i) {
    let part = pathParts[i];

    packageFolder = path.join(packageFolder, part)

    if (stopOnNext && !part.startsWith('@')) {
      break;
    } else if (part === 'node_modules') {
      stopOnNext = true;
    }
  }

  return path.relative('..', packageFolder);
}

function removeExtension(filePath) {
  let ext = path.extname(filePath);

  if (ext) {
    return filePath.replace(ext, '');
  } else {
    return filePath;
  }
}
