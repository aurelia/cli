'use strict';

var Promise = require('bluebird');
var inquirer = require('inquirer');

function Ask(prompts) {
  return new Promise(function (resolve, reject) {
    if (!prompts.length) {
      return reject('Please provide a collection of prompts to the ask() service!');
    }

    inquirer.prompt(prompts, function (answers) {
      resolve(answers);
    });
  });
}

module.exports = Ask;