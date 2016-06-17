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

exports.bundle = function() {
  return through.obj(function(file, encoding, callback) {
    callback(null, capture(file));
  });
};

exports.dest = function() {
  return bundler.write();
}

function capture(file) {
  if (isUpdating) {
    bundler.updateFile(file);
  } else {
    bundler.addFile(file);
  }
}
