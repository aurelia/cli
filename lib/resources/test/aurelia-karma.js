(function(karma, requirejs, locationPathname) {

/* eslint-disable no-unused-vars */

// monkey patch requirejs, to use append timestamps to sources
// to take advantage of karma's heavy caching
// it would work even without this hack, but with reloading all the files all the time

var normalizePath = function (path) {
  var normalized = []
  var parts = path
    .split('?')[0] // cut off GET params, used by noext requirejs plugin
    .split('/')

  for (var i = 0; i < parts.length; i++) {
    if (parts[i] === '.') {
      continue
    }

    if (parts[i] === '..' && normalized.length && normalized[normalized.length - 1] !== '..') {
      normalized.pop()
      continue
    }

    normalized.push(parts[i])
  }

  return normalized.join('/')
}

var createPatchedLoad = function (files, originalLoadFn, locationPathname) {
  var IS_DEBUG = /debug\.html$/.test(locationPathname)

  return function (context, moduleName, url) {
    url = normalizePath(url)

    if (files.hasOwnProperty(url) && !IS_DEBUG) {
      url = url + '?' + files[url]
    }

    if (url.indexOf('/base') !== 0) {
      url = '/base/' + url;
    }

    return originalLoadFn.call(this, context, moduleName, url)
  }
}

// make it async
karma.loaded = function() {};

// patch require.js
requirejs.load = createPatchedLoad(karma.files, requirejs.load, locationPathname);

})(window.__karma__, window.requirejs, window.location.pathname);


var TEST_REGEXP = /(spec)\.js$/i;
var allTestFiles = ['/base/test/unit/setup.js'];

Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    allTestFiles.push(file);
  }
});

require(allTestFiles, window.__karma__.start);
