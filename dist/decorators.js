"use strict";

var _Object$defineProperty = require("babel-runtime/core-js/object/define-property")["default"];

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.command = command;
exports.alias = alias;
exports.option = option;
exports.args = args;
exports.description = description;

function command(value) {
  return function (target) {
    target.command = value;
  };
}

function alias(value) {
  return function (target) {
    target.alias = value;
  };
}

function option(opt, description, fn, defaultValue) {
  return function (target) {
    target.options = target.options || [];
    target.options.push({
      opt: opt,
      desc: description,
      fn: fn,
      defaultValue: defaultValue
    });
  };
}

function args(value) {
  return function (target) {
    target.args = value;
  };
}

function description(value) {
  return function (target) {
    target.description = value;
  };
}