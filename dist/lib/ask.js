'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

exports.ask = ask;
var Promise = require('bluebird');
var inquirer = require('inquirer');

// Ask
// Service for prompting users and promising the answers
// @param {Array}  prompts  requires a prompts array containing the correct prompt syntax form inquirer.js

function ask(prompts) {
  return new Promise(function (resolve, reject) {
    if (!prompts.length) {
      return reject('Please provide a collection of prompts to the ask() service!');
    }

    inquirer.prompt(prompts, function (answers) {
      resolve(answers);
    });
  });
}