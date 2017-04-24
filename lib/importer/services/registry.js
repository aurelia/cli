'use strict';

const fs = require('../../file-system');
const semver = require('semver');

let Registry = class {
  getPackageConfig(pkg, version) {
    let folder = fs.join(__dirname, `../registry/${pkg.name}`);

    if (!fs.existsSync(folder)) {
      return Promise.resolve(null);
    }

    return this._getAvailableVersions(folder)
    .then(files => this._findBestMatch(files, version))
    .then(match => {
      if (!match) {
        return Promise.resolve(null);
      }

      return fs.readFile(fs.join(folder, match + '.json'));
    }).then(contents => JSON.parse(contents));
  }

  _getAvailableVersions(folder) {
    return fs.readdir(folder)
    .then(files => {
      return files.map(x => x.replace('.json', ''));
    });
  }

  // find the closest matching version to the target
  // but not anything above the target version
  _findBestMatch(versions, target) {
    let bestMatch;

    let validVersions = versions.filter(x => semver.valid(x));

    for (let i = 0; i < validVersions.length; i++) {
      let version = validVersions[i];

      if (semver.eq(version, target)) {
        return version;
      }

      if (semver.lt(version, target)) {
        if (!bestMatch || semver.gt(version, bestMatch)) {
          bestMatch = version;
        }
      }
    }

    return bestMatch;
  }
};

module.exports = Registry;
