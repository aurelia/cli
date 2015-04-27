var Promise = require('bluebird');
var inquirer = require('inquirer');
var logger   = require('./logger');

module.exports = function Ask(prompts) {
    return new Promise(function(){
        if (!prompts.length) {
            logger.err('Please provide a collection of prompts to the ask() service!');
            return reject()
        }

        inquirer.prompt(prompts, function(answers){
            resolve(answers);
        });
    });
};
