(function(global) {
  var karma = global.__karma__;
  var root = 'src';
  karma.config.args.forEach(function(value, index) {
    if (value === 'aurelia-root') {
      root = karma.config.args[index + 1];
    }
  });

  if (!karma) {
    return;
  }

  function patchSystemJS() {
    SystemJS.config({
      "packages": {
        "base/test": {
          "defaultExtension": "js"
        }
      }
    });

    var originalDefine = global.define;
    global.define = function(name, deps, m) {
      if (typeof name === 'string') {
        originalDefine('/base/' + root + '/' + name, [name], function (result) { return result; });
      }

      return originalDefine(name, deps, m);
    }
  }

  function requireTests() {
    var TEST_REGEXP = /(spec)\.js$/i;
    var allTestFiles = [];

    Object.keys(window.__karma__.files).forEach(function(file) {
      if (TEST_REGEXP.test(file)) {
        allTestFiles.push(file);
      }
    });

    require(['/base/test/unit/setup.js'], () => {
      require(allTestFiles, window.__karma__.start);
    });
  }

  karma.loaded = function() {}; // make it async
  patchSystemJS();
  requireTests();
})(window);
