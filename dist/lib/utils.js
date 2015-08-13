'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

exports.ucFirst = ucFirst;
exports.toCamelCase = toCamelCase;
exports.dashToCamelCase = dashToCamelCase;
exports.parseList = parseList;

function ucFirst(val) {
  return val.charAt(0).toUpperCase() + val.slice(1);
}

function toCamelCase(str) {
  if (str) {
    return str.replace(/\s(.)/g, function ($1) {
      return $1.toUpperCase();
    }).replace(/\s/g, '').replace(/^(.)/, function ($1) {
      return $1.toLowerCase();
    });
  }
}

function dashToCamelCase(str) {
  return str.replace(/[-_]([a-z])/g, function (g) {
    return g[1].toUpperCase();
  });
}

function parseList(listString) {
  if (listString) return listString.split(/[ ,]+/);
}

module.exports = {
  ucFirst: ucFirst,
  toCamelCase: toCamelCase,
  dashToCamelCase: dashToCamelCase,
  parseList: parseList
};