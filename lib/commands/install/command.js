"use strict";
const extend = require('../objectAssignDeep');
const aureliaConfigFilePath = './aurelia_project/aurelia.json';
const jsonfile = require('jsonfile')

module.exports = class {
  execute(args) {
    const registry = require('registry.json');

    let name = args[0];
    let libConfig = registry[name];
    if (!libConfig) {
      reject(new Error(`No registry definition for library ${name}. Please add it to the registry in the aurelia/cli repo :)`))
    }

    const currentConfig = jsonfile.readFile(aureliaConfigFilePath, (err, libConfig) => {
      const newConfig =  extend(currentConfig, libConfig);
      jsonfile.writeFile(aureliaConfigFilePath, newConfig, {spaces: 2}, (err) => {
        console.error(err)
      });
    });
  }
}
