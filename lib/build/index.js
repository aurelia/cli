"use strict";
const Bundler = require('./bundler').Bundler;
const PackageAnalyzer = require('./package-analyzer').PackageAnalyzer;

let bundler;
let project;
let isUpdating = false;
let through;

exports.src = function(p) {
  if (bundler) {
    isUpdating = true;
    return Promise.resolve(bundler);
  }

  through = require('through2'); //dep of vinyl-fs
  project = p;
  return Bundler.create(project, new PackageAnalyzer(project)).then(b => bundler = b);
}

exports.createLoaderCode = function(p){
  const createLoaderCode = require('./loader').createLoaderCode;
  project = p || project;
  return buildLoaderConfig(project)
      .then(() => {
        let platform = project.build.targets[0];
        return createLoaderCode(platform, bundler); 
      });  
}

exports.createLoaderConfig = function(p){
  const createLoaderConfig = require('./loader').createLoaderConfig;
  project = p || project;

  return buildLoaderConfig(project)
      .then(() => {
        let platform = project.build.targets[0];
        return createLoaderConfig(platform, bundler); 
      });  
};

exports.bundle = function() {
  return through.obj(function(file, encoding, callback) {
    callback(null, capture(file));
  });
};

exports.dest = function() {
  return bundler.build()
    .then(() => bundler.write());
}

function buildLoaderConfig(p){
  project = p || project;
  through = require('through2'); //dep of vinyl-fs
  let configPromise = Promise.resolve();

  if (!bundler) {
    //If a bundler doesn't exist then chances are we have not run through getting all the files, and therefore the "bundles" will not be complete
    configPromise = configPromise.then(() => {
      return Bundler.create(project, new PackageAnalyzer(project)).then(b => bundler = b)
    });     
  }  

  return configPromise.then(() => {
    return bundler.build();   
  });
}

function capture(file) {
  if (isUpdating) {
    bundler.updateFile(file);
  } else {
    bundler.addFile(file);
  }
}
