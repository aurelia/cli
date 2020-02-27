const gulp = require('gulp');
const latestVersion = require('latest-version');
const fs = require('fs');
const path = require('path');

const depJsonPath = path.resolve(__dirname, '../../lib/dependencies.json');

const ignore = ['text', 'gulp', 'extract-text-webpack-plugin'];

gulp.task('update-cli-dependenciesjs', function(done) {
  let deps = getDepsJSON();
  updateCLIVersion(deps);

  write(deps).then(() => done());
});

// this task goes through ./lib/dependencies.json and updates all libs
// to use the latest version
gulp.task('update-all-dependenciesjs', async() => {
  let deps = getDepsJSON();
  let lookup = Object.keys(deps).filter(x => !ignore.includes(x));

  // for all entries in dependencies.json, lookup the latest version and update the json file
  for (let i = 0; i < lookup.length; i++) {
    const ver = await latestVersion(lookup[i]);
    console.log(`Latest version of ${lookup[i]} (currently ${deps[lookup[i]]}) is: ${ver}`);
    deps[lookup[i]] = '^' + ver;
  }

  await updateCLIVersion(deps);
  await write(deps);
});

function getDepsJSON() {
  return require(depJsonPath);
}

function write(deps) {
  return new Promise((resolve, reject) => {
    fs.writeFile(depJsonPath, JSON.stringify(deps, null, 2), function(err) {
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
  let {version} = require('../../package.json');
  version = '^' + version;
  deps['aurelia-cli'] = version;
  console.log('Updated aurelia-cli version to what\'s currently in package.json: ' + version);
}
