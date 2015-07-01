import * as logger from '../logger';
import * as installer from '../installer';
import util from 'util';
import fs from 'fs';
import {
  spawn, exec
}
from 'child-process-promise';
import Promise from 'bluebird';

var jspm = process.platform === "win32" ? "jspm.cmd" : "jspm";

function update(options) {
  if (options.nuclear) {
    logger.log('Going NUCLEAR!')
    logger.log('Clearing jspm packages...');
    moveJSPMPackages(function() {
      logger.log('Clearing npm packages...');
      moveNPMPackages(function() {
        normalUpdate();
      });
    });
  } else {
    logger.log('Updating normally...');
    normalUpdate();
  }
}

function unbundle() {
  logger.log('Running jspm unbundle');
  return spawn(jspm, ['unbundle']);
}

function normalUpdate() {
  var updateCommands = [];
  var repoList = readConfigJs();

  unbundle()
    .then(() => {
      installer
        .runNPMInstall(function() {
          logger.log('Successfully npm installed');
          logger.log('Updating all aurelia libs');

          Promise.all(repoList.map(repo => {
             return spawn(jspm, ['install', repo])
                .progress(function(cp) {
                  cp.stdout.on('data', function(data) {
                    logger.log(data.toString());
                  });

                  cp.stderr.on('data', function(data) {
                    logger.err('Errror: ', data.toString());
                  });
                });
            }))
            .then(function() {
              logger.log('LASTLY, CLEANING JSPM')
              spawn(jspm, ['clean']);
            });
        });
    })
    .fail((err) => {
      logger.err(err.toString());
    });
}

function moveJSPMPackages(done) {
  fs.rename('./jspm_packages', './jspm_packages_backup', done);
}

function moveNPMPackages(done) {
  fs.rename('node_modules', 'node_modules_backup', done);
}

function canAddToRepoList(list, reponame) {
  return reponame.indexOf('github:aurelia/') !== -1;
}

function readConfigJs() {
  var cfg = {};
  var System = {
    config: function(_cfg) {
      for (var c in _cfg) {
        if (!_cfg.hasOwnProperty(c))
          continue;
        var v = _cfg[c];
        if (typeof v === 'object') {
          cfg[c] = cfg[c] || {};
          for (var p in v) {
            if (!v.hasOwnProperty(p))
              continue;
            cfg[c][p] = v[p];
          }
        } else
          cfg[c] = v;
      }
    },
    paths: {},
    map: {},
    versions: {}
  };
  var source;
  source = fs.readFileSync('config.js');
  eval(source.toString())
  var config = System.config;
  delete System.config;
  config(System);
  var repoList = getRepoList(cfg.map);
  return repoList;
}

var repoMatcher = new RegExp(/(:aurelia)(.*?)(?=@)/)

function getRepoList(maps) {
  var list = [];
  for (let p in maps) {
    var v = maps[p];
    if (typeof v === 'object') {
      if (canAddToRepoList(list, p)) {
        var newValue = p.match(repoMatcher);
        if (newValue){
          newValue = 'aurelia-' + newValue[0].substring(9);
        }
        list.push(newValue);
      }
    } else {
      if (canAddToRepoList(list, v)) {
        var newValue = v.match(repoMatcher);
        if (newValue){
          newValue = 'aurelia-' + newValue[0].substring(9);
        }
        list.push(newValue);
      }
    }
  }
  return list;
}

module.exports = {
  update: update
}
