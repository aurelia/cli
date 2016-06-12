"use strict";
const through = require('through2'); //dep of vinyl-fs
const Bundler = require('./bundler').Bundler;
const PackageAnalyzer = require('./package-analyzer').PackageAnalyzer;

let bundler;
let project;
let isUpdating = false;

exports.src = function(p) {
  if (bundler) {
    isUpdating = true;
    return Promise.resolve(bundler);
  }

  project = p;
  return Bundler.create(project, new PackageAnalyzer(project)).then(b => bundler = b);
}

exports.bundle = function() {
  return through.obj(function(file, encoding, callback) {
    callback(null, capture(file));
  });
};

exports.dest = function(destination) {
  return bundler.write(destination || project.paths.output);
}

function capture(file) {
  if (isUpdating) {
    bundler.updateFile(file);
  } else {
    bundler.addFile(file);
  }
}
