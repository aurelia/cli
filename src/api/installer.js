var ghdownload = require('download-github-repo')
  , GitHubApi  = require("github")
  , Promise = require('bluebird');

var github = new GitHubApi({
  // required
  version: "3.0.0",
  debug: false,
  protocol: "https",
  host: "api.github.com",
  pathPrefix: "",
  timeout: 5000,
  headers: {
    "user-agent": "Aurelia-Github-Loader"
  }
});

function installTemplate(repoName) {
  // find the latest available tag
  return new Promise(function(resolve, reject){

    github.repos.getTags({ user: 'aurelia', repo: repoName, page: 1, per_page: 1 }, function(err, result) {
      if(err !== undefined && err !== null) {
        reject('Failed to get latest release info');
        return;
      }

      if(result.length < 1) {
        reject('No Release-Tags available');
        return;
      }
      console.log('Downloading latest available release: ' + result[0].name);

      // Kick off the repo download
      ghdownload("aurelia/skeleton-navigation#" + result[0].name, "", function(err) {
        if (err !== undefined && err !== null) {
          reject('An error occurred while downloading the template');
          console.log(err);
        } else {
          console.log('Successfully installed template: ' + repoName);
          console.log('Running npm install');
          runNPMInstall(function() {
            console.log('Successfully npm installed');
            console.log('Running jspm install');
            runJSPMInstall(function() {
              console.log('Successfully jspm installed');
              resolve('Installation completed successfully');
            });
          });
        }
      });
    });
  });
}

function runNPMInstall(cb) {
  var npm = require('npm');
  npm.load(function(err) {
    npm.commands.install(['.'], function(er, data) {
      if(er !== undefined && er !== null) {
        console.log(er);
        throw 'Error running NPM install';
      } else {
        cb();
      }
    });

    npm.on("log", function (message) {
      // log the progress of the installation
      console.log(message);
    });
  });
}

function runJSPMInstall(cb) {
  var jspm = require('jspm');
  jspm.configureLoader({ transpiler: 'babel'})
    .then(function() {
      return jspm.dlLoader();
    })
    .then(function() {
      jspm.install(true).then(cb);
    });
}

module.exports = {
  installTemplate: installTemplate,
  runNPMInstall: runNPMInstall,
  runJSPMInstall: runJSPMInstall
};
