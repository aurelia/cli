'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.start = start;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _libLogger = require('./lib/logger');

var logger = _interopRequireWildcard(_libLogger);

var _libUtils = require('./lib/utils');

var utils = _interopRequireWildcard(_libUtils);

var cli = process.AURELIA;
var program = require('commander');
var Promise = require('bluebird');

function start() {

  program.command('bundle').alias('b').description('Create a new bundle based on the configuration in Aureliafile.js').option('-a --add <path>', 'Add system.js path to files or file to bundle').option('-r --remove <remove_path>', 'Remove file path or file from bundle').option('-l, --list', 'List paths and files included in bundle').action(cli.execute('bundle')).on('--help', function () {
    utils.example('generate', {
      add: {
        flags: '-a --add <path>',
        info: 'Add system.js path to files or file to bundle',
        required: true
      },
      remove: {
        flags: '-r --remove <remove_path>',
        info: 'Remove file path or file from bundle',
        required: true
      },
      list: {
        flags: '-l, --list',
        info: 'List paths and files included in bundle',
        required: true
      } });
  });

  program.command('generate <type>').alias('g').description('Generate new file type based on type specified').option('-n, --name <name>', 'Name of the file / class').option('-v, --view', 'Create a view for generated file type').option('-i, --inject <list>', 'Name of dependency to inject', utils.parseList).option('--no-lifecycle', 'Do not create lifecycle callbacks, if applicable').option('-t, --template <name>', 'Specify the name of the template to use as override').action(cli.execute('generate')).on('--help', function () {
    utils.example('generate', {
      name: {
        flags: '-n, --name <name>',
        info: 'Name of the file / class',
        required: true
      },
      view: {
        flags: '-v, --view',
        info: 'Create a view for generated file type',
        required: false,
        type: 'bool'
      },
      inject: {
        flags: '-i, --inject <list>',
        info: 'Name of dependency to inject',
        required: true,
        type: 'list'
      },
      lifecycle: {
        flags: '--no-lifecycle',
        info: 'Do not create lifecycle callbacks, if applicable',
        required: false,
        type: 'bool'
      },
      template: {
        flags: '-t, --template <name>',
        info: 'Specify the name of the template to use as override',
        required: true
      }
    });
  });

  program.command('plugin <plugin_name>').alias('p').description('List all installed plugins').option('-a, --add <name>', 'Add plugin from Aurelia plugin repo').option('-r, --remove <name>', 'Disable plugin from project').option('-t, --template <name>', 'Disable plugin from project').option('-c, --clear', 'Completely remove plugin and files').action(cli.execute('plugin')).on('--help', function () {
    utils.example('plugin', {
      add: {
        flags: '-a, --add <name>',
        info: 'Add plugin from Aurelia plugin repo',
        required: true
      },
      remove: {
        flags: '-r, --remove <name>',
        info: 'Disable plugin from project',
        required: true
      },
      template: {
        flags: '-t, --template <name>',
        info: 'Disable plugin from project',
        required: true
      },
      clear: {
        flags: '-c, --clear',
        info: 'Completely remove plugin and files',
        required: false
      } });
  });

  program.command('update').alias('u').description('Update aurealia').option('--nuclear', 'Go nuclear').action(cli.execute('updater')).on('--help', function () {
    utils.example('update', {
      nuclear: {
        flags: '--nuclear <name>',
        info: 'Blow it up',
        required: false
      } });
  });
}