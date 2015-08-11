import download from 'download-github-repo';
import GitHubApi  from 'github';
import Promise from 'bluebird';
import request from 'request';
import jspm from 'jspm';

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

var pluginList = null;

export function installTemplate(repoName) {
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

export function runNPMInstall(cb) {
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

export function runJSPMInstall(cb) {
  var jspm = require('jspm');
  jspm.configureLoader({ transpiler: 'babel'})
    .then(function() {
      return jspm.dlLoader();
    })
    .then(function() {
      jspm.install(true).then(cb);
    });
}

function _loadPluginList() {
  return new Promise(function(resolve, reject) {
    if(pluginList === null) {
      request.get('https://raw.githubusercontent.com/aurelia/registry/master/plugin-registry.json', function(error, response, body) {
        if (!error && response.statusCode == 200) {
          pluginList = JSON.parse(body).plugins;
          resolve(pluginList);
        } else {
          reject(error);
        }
      });
    } else {
      resolve(pluginList);
    }
  });
}

export function getPluginListPrompt() {
  return _loadPluginList().then( (list) => {
    var registry = {};

    list.map( (plugin) => {
      registry[plugin.name] = plugin.name;
    });

    return registry;
  });
}

export function getPluginInfo(name) {
  return _loadPluginList().then( (list) => {
    var result = list.filter( (plugin) => {

      return plugin.name === name;
    });

    if(result && result.length > 0) {
      return result[0];
    } else {
      return null;
    }
  });
}

export function installPlugin(name, endpoint, location) {
  return new Promise(function(resolve, reject) {
    let user = location.substring(0, location.indexOf('/'))
      , repo = location.substring(location.indexOf('/') + 1);

    github.repos.getTags({user: user, repo: repo, page: 1, per_page: 1}, function(err, result) {
      if (err !== undefined && err !== null) {
        logger.error('blub');
        reject('Failed to get latest release info');
        return;
      }

      let tag = "master";

      if (result.length > 0) {
        tag = "^" + result[0].name;
      }

      jspm.install(name, endpoint + ':' + location + '@^' + tag)

      return jspm.install(name, endpoint + ':' + location + '@' + tag).then( (result) => {

        resolve("Successfully installed plugin " + name + "@" + tag);
      }).catch( (err) => {
        console.log(err);
      });
    });

  });
}
