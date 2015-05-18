'use strict';

var fs = require('fs'),
    handlebars = require('handlebars'),
    Promise = require('bluebird'),
    chalk = require('chalk');

var cli = process.AURELIA,
    ask = cli['import']('lib/ask'),
    utils = cli['import']('lib/utils'),
    logger = cli.logger;

handlebars.registerHelper('toCamelCase', function (str) {
  return utils.toCamelCase(str);
});

handlebars.registerHelper('join', function (items, separator, options) {
  return items.map(function (item) {
    return options.fn(item);
  }).join(separator);
});

function getCompiledTemplate(template) {
  var templateContent;
  try {
    templateContent = fs.readFileSync(__dirname + '/templates/' + template, { encoding: 'utf-8' });
  } catch (ex) {
    throw 'the entered template does not exist';
  }

  return handlebars.compile(templateContent);
}

function createView(name, template) {
  var compiled = getCompiledTemplate(templateTypes.view + '.' + template + '.html');

  logger.log(chalk.bgMagenta('vvvvvv [Here is what we created for you] vvvvvv'));
  var resultingFile = compiled({
    pageName: utils.ucFirst(name)
  });
  console.log(resultingFile);

  return promptForCreation(name + '.js').then(function (response) {
    return writeFile(response, name + '.html', resultingFile);
  }).then(function (result) {
    logger.ok(result);
  })['catch'](function (err) {
    logger.err('Issue generating!');
    logger.err(err);
  });
}

function createViewModel(name, template, inject) {
  var compiled = getCompiledTemplate(templateTypes.vm + '.' + template + '.js');

  logger.log(chalk.bgMagenta('vvvvvv [Here is what we created for you] vvvvvv'));
  var resultingFile = compiled({
    pageName: utils.ucFirst(name),
    isInjectionUsed: inject !== undefined && inject.length > 0,
    inject: inject
  });
  console.log(resultingFile);

  return promptForCreation(name + '.js').then(function (response) {
    return writeFile(response, name + '.js', resultingFile);
  }).then(function (result) {
    logger.ok(result);
  })['catch'](function (err) {
    logger.err('Issue generating!');
    logger.err(err);
  });
}

function promptForCreation(fileName) {
  var prompts = [{
    type: 'confirm',
    name: 'create',
    message: 'Like it? Continue creating the file: ' + fileName,
    'default': false
  }];

  return ask(prompts);
}

function writeFile(response, fileName, fileContents) {
  return new Promise(function (resolve, reject) {
    if (response.create === true) {
      fs.writeFile('src/' + fileName, fileContents, function (err) {
        if (err !== undefined && err !== null) {
          reject(err);
        } else {
          resolve('File ' + fileName + ' successfully created');
        }
      });
    } else {
      reject('Aborted by user');
    }
  });
}

var templateTypes = {
  vm: 'viewmodel',
  view: 'view'
};

module.exports = {
  createViewModel: createViewModel,
  createView: createView,
  templateType: templateTypes
};