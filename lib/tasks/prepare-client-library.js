"use strict";

module.exports = function(libraryName, force) {
  //check client_modules; if present and !force, return;

  //locate library in node_modules, load package.json
  //look for jspm.directories.dist, jspm.main, jspm.format
  //else look for browser config
  //else look for main

  //check for existing folder in client_modules; delete if necessary

  //create library folder under client_modules
  //copy library files to folder

  //detect module format on each file
  //convert files to amd format

  //write path config
}
