const InstallNodeModules = require('./install-node-modules');
const ChangeDirectory = require('./change-dir');
const ExecuteCommand = require('./execute-command');
const TakeScreenShotOfPage = require('./take-screenshot-of-page');
const InstallLatestAureliaCLI = require('./install-latest-aurelia-cli');
const DotNetNewWeb = require('./dotnet-new-web');

module.exports = {
  InstallNodeModules,
  ChangeDirectory,
  ExecuteCommand,
  TakeScreenShotOfPage,
  InstallLatestAureliaCLI,
  DotNetNewWeb
};
