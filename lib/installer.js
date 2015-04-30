var ghdownload = require('download-github-repo')
  , GitHubApi = require("github");

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

  github.repos.getTags({ user: 'aurelia', repo: repoName, page: 1, per_page: 1 }, function(err, result) {
    if(err !== undefined) {
      console.error('Failed to get latest release info');
      return;
    }
    console.log('Downloading latest available release: ' + result[0].name);

    // Kick off the repo download
    ghdownload("aurelia/skeleton-navigation#" + result[0].name, "", function(err) {
      if (err !== undefined) {
        console.error('An error occured while downloading the template');
        console.log(err);
      } else {
        console.log('Successfully installed template: ' + repoName);
        console.log('Running npm install');
        runNPMInstall(function() {
          console.log('Successfully npm installed');
          console.log('Running jspm install');
          runJSPMInstall(function() {
            console.log('Successfully jspm installed');
          });
        });
      }
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
  jspm.install(true).then(cb);
}

module.exports = {
  installTemplate: installTemplate,
  runNPMInstall: runNPMInstall,
  runJSPMInstall: runJSPMInstall
};
