const {Transform} = require('stream');
const Bundler = require('./bundler').Bundler;
const PackageAnalyzer = require('./package-analyzer').PackageAnalyzer;
const PackageInstaller = require('./package-installer').PackageInstaller;
const cacheDir = require('./utils').cacheDir;
const fs = require('fs');

let bundler;
let project;
let isUpdating = false;

exports.src = function(p) {
  if (bundler) {
    isUpdating = true;
    return Promise.resolve(bundler);
  }

  project = p;
  return Bundler.create(
    project,
    new PackageAnalyzer(project),
    new PackageInstaller(project)
  ).then(b => bundler = b);
};

exports.createLoaderCode = function(p) {
  const createLoaderCode = require('./loader').createLoaderCode;
  project = p || project;
  return buildLoaderConfig(project)
    .then(() => {
      let platform = project.build.targets[0];
      return createLoaderCode(platform, bundler);
    });
};

exports.createLoaderConfig = function(p) {
  const createLoaderConfig = require('./loader').createLoaderConfig;
  project = p || project;

  return buildLoaderConfig(project)
    .then(() => {
      let platform = project.build.targets[0];
      return createLoaderConfig(platform, bundler);
    });
};

exports.bundle = function() {
  return new Transform({
    objectMode: true,
    transform: function(file, encoding, callback) {
      callback(null, capture(file));
    }
  });
};

exports.dest = function(opts) {
  return bundler.build(opts)
    .then(() => bundler.write());
};

exports.clearCache = function() {
  // delete cache folder outside of cwd
  return fs.promises.rm(cacheDir, { recursive: true, force: true });
};

function buildLoaderConfig(p) {
  project = p || project;
  let configPromise = Promise.resolve();

  if (!bundler) {
    //If a bundler doesn't exist then chances are we have not run through getting all the files, and therefore the "bundles" will not be complete
    configPromise = configPromise.then(() => {
      return Bundler.create(
        project,
        new PackageAnalyzer(project),
        new PackageInstaller(project)
      ).then(b => bundler = b);
    });
  }

  return configPromise.then(() => {
    return bundler.build();
  });
}

function capture(file) {
  // ignore type declaration file generated by TypeScript compiler
  if (file.path.endsWith('d.ts')) return;

  if (isUpdating) {
    bundler.updateFile(file);
  } else {
    bundler.addFile(file);
  }
}
