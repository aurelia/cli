'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.kindof = kindof;
exports.isArgRequired = isArgRequired;
exports.isArgOptional = isArgOptional;
exports.parseRequiredArg = parseRequiredArg;
exports.parseOptionalArg = parseOptionalArg;
exports.parseArg = parseArg;
exports.noop = noop;
var fs = require('fs'),
    path = require('path'),
    _f = require('fs-utils'),
    repeat = require('lodash/string/repeat');

function kindof(thing) {
  return Object.defineProperties({}, {
    fn: {
      get: function () {
        return typeof thing === 'function';
      },
      configurable: true,
      enumerable: true
    },
    array: {
      get: function () {
        return Array.isArray(thing);
      },
      configurable: true,
      enumerable: true
    },
    object: {
      get: function () {
        return typeof thing === 'object' && !thing.length;
      },
      configurable: true,
      enumerable: true
    },
    string: {
      get: function () {
        return typeof thing === 'string';
      },
      configurable: true,
      enumerable: true
    }
  });
}

function isArgRequired(arg) {
  return /\</.test(arg);
}

function isArgOptional(arg) {
  return /\[/.test(arg);
}

function parseRequiredArg(arg) {
  return arg.match(/\<([a-z]+)\>/)[1];
}

function parseOptionalArg(arg) {
  console.log(arg.match(/\[([a-z]+)\]/));
  return arg.match(/\[([a-z]+)\]/)[1];
}

function parseArg(arg) {
  var _optional = undefined,
      _required = undefined;
  var name = (_optional = isArgOptional(arg)) && parseOptionalArg(arg) || (_required = isArgRequired(arg)) && parseRequiredArg(arg);
  return { name: name, optional: _optional, required: _required };
}

function noop(b) {
  return b;
}

;