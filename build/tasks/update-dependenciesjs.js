const gulp = require('gulp');
const latestVersion = require('latest-version');
const fs = require('fs');
const path = require('path');

const ignore = ['text', 'gulp', 'extract-text-webpack-plugin'];

gulp.task('update-cli-dependenciesjs', function(done) {
  let deps = getDepsJSON();
  updateCLIVersion(deps);

  write(deps).then(() => done());
});

// this task goes through ./lib/dependencies.json and updates all libs
// to use the latest version
gulp.task('update-all-dependenciesjs', function() {
  let deps = getDepsJSON();
  let p = Promise.resolve();
  let lookup = Object.keys(deps).filter(x => !ignore.includes(x));

  // for all entries in dependencies.json, lookup the latest version and update the json file
  for (let i = 0; i < lookup.length; i++) {
    p = p.then(() => {
      return latestVersion(lookup[i])
      .then(ver => {
        console.log(`Latest version of ${lookup[i]} (currently ${deps[lookup[i]]}) is: ${ver}`);
        deps[lookup[i]] = '^' + ver;
      });
    });
  }

  // when all versions are looked up, write the dependencies.json file to disk
  return p
  .then(() => updateCLIVersion(deps))
  .then(() => write(deps));
});

function getDepsJSON() {
  let dependenciesJSONFile = path.resolve('./lib/dependencies.json');
  return require(dependenciesJSONFile);
}

function write(deps) {
  return new Promise((resolve, reject) => {
    let dependenciesJSONFile = path.resolve('./lib/dependencies.json');

    fs.writeFile(dependenciesJSONFile, JSON.stringify(deps, null, 2), function(err) {
      if (err) {
        reject(err);
        return console.log(err);
      }

      console.log('dependencies.json was updated');
      resolve();
    });
  });
}

function updateCLIVersion(deps) {
  let pJSON = require('../../package.json');
  let version = '^' + pJSON.version;
  deps['aurelia-cli'] = version;
  console.log('Updated aurelia-cli version to what\'s currently in package.json: ' + version);
}
