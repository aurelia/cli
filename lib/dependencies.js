"use strict";

let versionMap = {
  "gulp": "github:gulpjs/gulp#4.0",
  "typescript": ">=1.9.0-dev || ^2.0.0"
};

exports.getSupportedVersion = function(name) {
  return versionMap[name] || 'latest';
};
