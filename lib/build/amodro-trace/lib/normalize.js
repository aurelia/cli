var parse = require('./parse');

module.exports = {
  normalizeModuleId: function (moduleId) {
    if (parse.hasPrefix(moduleId)) {
      moduleId = moduleId.split('!')[1];
    }

    if (moduleId.slice(-1) === '/') {
      moduleId = moduleId.slice(0, -1);
    }

    if (moduleId.length > 3 && moduleId.slice(-3) === '.js') {
      moduleId = moduleId.slice(0, -3);
    }

    return moduleId;
  }
};
