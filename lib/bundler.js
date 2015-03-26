var api = require('jspm/api');

function bundleJS(configs) {
  configs.forEach(function(cfg) {
    api.bundle(cfg.moduleExpression, cfg.fileName, cfg.options);
  });
}

module.exports = {
  bundleJS: bundleJS
}
