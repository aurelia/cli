'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.ucFirst = ucFirst;
exports.toCamelCase = toCamelCase;
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

function parseList(listString) {
  if (listString) return listString.split(/[ ,]+/);
}