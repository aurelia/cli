'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

exports.installTemplate = installTemplate;
exports.runNPMInstall = runNPMInstall;
exports.runJSPMInstall = runJSPMInstall;
exports.getPluginListPrompt = getPluginListPrompt;
exports.getPluginInfo = getPluginInfo;
exports.installPlugin = installPlugin;

var _downloadGithubRepo = require('download-github-repo');

var _downloadGithubRepo2 = _interopRequireDefault(_downloadGithubRepo);

var _github = require('github');

var _github2 = _interopRequireDefault(_github);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _jspm = require('jspm');

var _jspm2 = _interopRequireDefault(_jspm);

var github = new _github2['default']({
  // required
  version: '3.0.0',
  debug: false,
  protocol: 'https',
  host: 'api.github.com',
  pathPrefix: '',
  timeout: 5000,
  headers: {
    'user-agent': 'Aurelia-Github-Loader'
  }
});

var pluginList = null;

function installTemplate(repoName) {
  // find the latest available tag
  return new _bluebird2['default'](function (resolve, reject) {

    github.repos.getTags({ user: 'aurelia', repo: repoName, page: 1, per_page: 1 }, function (err, result) {
      if (err !== undefined && err !== null) {
        reject('Failed to get latest release info');
        return;
      }

      if (result.length < 1) {
        reject('No Release-Tags available');
        return;
      }
      console.log('Downloading latest available release: ' + result[0].name);

      // Kick off the repo download
      ghdownload('aurelia/skeleton-navigation#' + result[0].name, '', function (err) {
        if (err !== undefined && err !== null) {
          reject('An error occurred while downloading the template');
          console.log(err);
        } else {
          console.log('Successfully installed template: ' + repoName);
          console.log('Running npm install');
          runNPMInstall(function () {
            console.log('Successfully npm installed');
            console.log('Running jspm install');
            runJSPMInstall(function () {
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
  npm.load(function (err) {
    npm.commands.install(['.'], function (er, data) {
      if (er !== undefined && er !== null) {
        console.log(er);
        throw 'Error running NPM install';
      } else {
        cb();
      }
    });

    npm.on('log', function (message) {
      // log the progress of the installation
      console.log(message);
    });
  });
}

function runJSPMInstall(cb) {
  var jspm = require('jspm');
  jspm.configureLoader({ transpiler: 'babel' }).then(function () {
    return jspm.dlLoader();
  }).then(function () {
    jspm.install(true).then(cb);
  });
}

function _loadPluginList() {
  return new _bluebird2['default'](function (resolve, reject) {
    if (pluginList === null) {
      _request2['default'].get('https://raw.githubusercontent.com/aurelia/registry/master/plugin-registry.json', function (error, response, body) {
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

function getPluginListPrompt() {
  return _loadPluginList().then(function (list) {
    var registry = {};

    list.map(function (plugin) {
      registry[plugin.name] = plugin.name;
    });

    return registry;
  });
}

function getPluginInfo(name) {
  return _loadPluginList().then(function (list) {
    var result = list.filter(function (plugin) {

      return plugin.name === name;
    });

    if (result && result.length > 0) {
      return result[0];
    } else {
      return null;
    }
  });
}

function installPlugin(name, endpoint, location) {
  return new _bluebird2['default'](function (resolve, reject) {
    var user = location.substring(0, location.indexOf('/')),
        repo = location.substring(location.indexOf('/') + 1);

    github.repos.getTags({ user: user, repo: repo, page: 1, per_page: 1 }, function (err, result) {
      if (err !== undefined && err !== null) {
        logger.error('blub');
        reject('Failed to get latest release info');
        return;
      }

      var tag = 'master';

      if (result.length > 0) {
        tag = '^' + result[0].name;
      }

      _jspm2['default'].install(name, endpoint + ':' + location + '@^' + tag);

      return _jspm2['default'].install(name, endpoint + ':' + location + '@' + tag).then(function (result) {

        resolve('Successfully installed plugin ' + name + '@' + tag);
      })['catch'](function (err) {
        console.log(err);
      });
    });
  });
}