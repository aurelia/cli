let versionMap = require('./dependencies.json');

exports.getSupportedVersion = function(name) {
  return versionMap[name] || 'latest';
};
