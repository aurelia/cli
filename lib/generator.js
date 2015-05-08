var fs = require('fs'),
  utils = require('./utils'),
  handlebars = require('handlebars'),
  Promise = require('bluebird'),
  chalk = require('chalk');

// Register handlebars helpers
handlebars.registerHelper('toCamelCase', function(str) {
  return utils.toCamelCase(str);
});

var cli    = process.AURELIA,
    ask    = cli.import('lib/ask'),
    logger = cli.import('lib/logger');

function getCompiledTemplate(template) {
  var templateContent;
  try {
    templateContent = fs.readFileSync(__dirname + '/generate/templates/' + template, { encoding: 'utf-8'});
  } catch(ex) {
    throw 'the entered template does not exist';
  }

  return handlebars.compile(templateContent);
}

function createView(name, template) {
  return new Promise(function(resolve, reject) {
    var compiled = getCompiledTemplate(templateTypes.view + '.' + template + '.html');

    logger.log(chalk.bgMagenta('vvvvvv [Here is what we created for you] vvvvvv'));
    var resultingFile = compiled({
      pageName: utils.ucFirst(name)
    });
    console.log(resultingFile);

    promptForCreation(name + '.html', resultingFile, resolve, reject);
  });
}



function createViewModel(name, template, inject) {
  return new Promise(function(resolve, reject) {
    var compiled = getCompiledTemplate(templateTypes.vm + '.' + template + '.js');

    logger.log(chalk.bgMagenta('vvvvvv [Here is what we created for you] vvvvvv'));
    var resultingFile = compiled({
      pageName: utils.ucFirst(name),
      isInjectionUsed: inject !== undefined,
      inject: inject
    });
    console.log(resultingFile);

    promptForCreation(name + '.js', resultingFile, resolve, reject);
  });
}

function promptForCreation(fileName, fileContents, resolve, reject) {
  var prompts = [{
    type: 'confirm',
    name: 'create',
    message: 'Like it? Continue creating the file: ' + fileName,
    default: false
  }];

  ask(prompts).then(function (response) {
    if (response.create === true) {
      fs.writeFile('src/' + fileName, fileContents, function (err) {
        if (err !== undefined && err !== null) {
          reject(err);
        } else {
          resolve('File ' + fileName + ' successfully created')
        }
      })
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
