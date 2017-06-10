const gulp = require('gulp');
const latestVersion = require('latest-version');
const fs = require('fs');
const path = require('path');

gulp.task('update-dependenciesjs', function() {
  let dependenciesJSONFile = path.resolve('./lib/dependencies.json');
  let deps = require(dependenciesJSONFile);
  let p = Promise.resolve();
  let lookup = Object.keys(deps).filter(x => x.startsWith('aurelia-'));

  // for all aurelia- libs, lookup the latest version and update the json file
  for (let i = 0; i < lookup.length; i++) {
    p = p.then(() => {
      return latestVersion(lookup[i])
      .then(ver => {
        console.log('Latest version of ' + lookup[i] + ' is: ' + ver);
        deps[lookup[i]] = '^' + ver;
      });
    });
  }

  // when all versions are looked up, write the dependencies.json file to disk
  return p
  .then(() => updateCLIVersion(deps))
  .then(() => {
    return new Promise((resolve, reject) => {
      fs.writeFile(dependenciesJSONFile, JSON.stringify(deps, null, 2), function(err) {
        if (err) {
          reject(err);
          return console.log(err);
        }

        console.log('dependencies.json was updated');
        resolve();
      });
    });
  });
});

function updateCLIVersion(deps) {
  let pJSON = require('../../package.json');
  let version = '^' + pJSON.version;
  deps['aurelia-cli'] = version;
  console.log('Updated aurelia-cli version to what\'s currently in package.json: ' + version);
}
