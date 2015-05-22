'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.ucFirst = ucFirst;
exports.toCamelCase = toCamelCase;
exports.parseList = parseList;
exports.example = example;
var fs = require('fs'),
    path = require('path'),
    _f = require('fs-utils'),
    repeat = require('lodash/string/repeat');

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

function example(name, commands) {

  var maxLen = 0;
  var logs = [];
  console.log('');
  console.log('(%s)(%s): %s', 'aurelia'.magenta, 'HELP'.green, name.green);
  console.log('');
  console.log(' @%s %s', 'Example'.green, name.green);
  console.log('');

  for (var idx in commands) {
    var cmd = commands[idx];
    var len = cmd.flags.length;
    if (len > maxLen) {
      maxLen = len;
    }
  }

  for (var index in commands) {
    var prefix = '   %s %s %s';
    var cmd = commands[index];
    var isMultiInfo = Array.isArray(cmd.info);

    var desc = undefined,
        _length = undefined,
        required = undefined;

    required = '(' + (cmd.required ? 'required' : 'optional') + ')';

    if (isMultiInfo) {
      _length = prefix.length + required.length + cmd.flags.length;
      desc = cmd.info.shift();
    } else {
      _length = prefix.length;
      desc = cmd.info;
    }

    desc = '  | ' + desc;
    if (cmd.flags.length !== maxLen) {
      required = repeat(' ', maxLen - cmd.flags.length) + required;
    }
    console.log(prefix, cmd.flags.cyan, required.red, desc);
    isMultiInfo && cmd.info.forEach(function (information) {

      console.log('%s %s', repeat(' ', maxLen), information);
    });
  }
  console.log('');
  console.log('');
}