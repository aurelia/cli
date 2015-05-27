'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _logger = require('../logger');

var logger = _interopRequireWildcard(_logger);

var _utils = require('../utils');

var utils = _interopRequireWildcard(_utils);

var _ask = require('../ask');

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _handlebars = require('handlebars');

var handlebars = _interopRequireWildcard(_handlebars);

var _bluebird = require('bluebird');

var bluebird = _interopRequireWildcard(_bluebird);

var _chalk = require('chalk');

var chalk = _interopRequireWildcard(_chalk);

// Register handlebars helpers
handlebars.registerHelper('toCamelCase', function (str) {
  return utils.toCamelCase(str);
});

handlebars.registerHelper('join', function (items, separator, options) {
  if (Array.isArray(items)) {
    return items.map(function (item) {
      return options.fn(item);
    }).join(separator);
  }

  return items;
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
  if (name === undefined || name === '') {
    throw 'You must provide a name for the new element';
    return;
  }

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
  if (name === undefined || name === '') {
    throw 'You must provide a name for the new element';
    return;
  }

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

  return (0, _ask.ask)(prompts);
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