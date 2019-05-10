const path = require('path');
const gulp = require('gulp');
const Vinyl = require('vinyl');
const pumpify = require('pumpify');
const lead = require('lead');
const through2 = require('through2');
const {prompt} = require('enquirer');
const prettyChoices = require('../pretty-choices');
const fs = require('../../file-system');
const _ = require('lodash');
const logger = require('aurelia-logging').getLogger('WriteProject');

module.exports = function(targetFolder, opts = {}) {
  // _question is an optional stub for easy testing
  const {unattended, _question} = opts;

  return lead(pumpify.obj(
    askIfExists(targetFolder, unattended, _question),
    skipDotnetCsprojIfExists(targetFolder),
    instructionsForSkippedFiles(targetFolder),
    gulp.dest(targetFolder, {
      overwrite: file => file.writePolicy !== 'skip',
      append: file => file.writePolicy === 'append',
      mode: parseInt('644', 8) // make sure files are writeable
    })
  ));
};

function askIfExists(targetFolder, unattended, question = askQuestion) {
  function exists(relativePath) {
    return fs.isFile(path.join(targetFolder, relativePath));
  }

  return through2.obj((file, enc, cb) => {
    if (file.isBuffer() && exists(file.relative)) {
      if (file.relative.match(/readme(.md|.markdown|.txt|.html)?$/i)) {
        // Special treatment for readme file, use append by default
        if (!file.writePolicy) file.writePolicy = 'append';
      } else if (file.relative === 'package.json') {
        // Special treatment for package.json file
        if (file.writePolicy) file.writePolicy = null;
        // Merge dependencies to existing package.json
        const packageJson = JSON.parse(fs.readFileSync(path.join(targetFolder, 'package.json'), 'utf8'));
        const newJson = JSON.parse(file.contents.toString('utf8'));
        const deps = _.pick(newJson, 'dependencies', 'devDependencies', 'peerDependencies');
        _.merge(packageJson, deps);
        file.contents = Buffer.from(JSON.stringify(packageJson, null, 2));
      } else if (file.writePolicy === 'ask') {
        let ask = unattended ? Promise.resolve(false) : question(file.relative);
        ask.then(toReplace => {
          // Unset write policy
          file.writePolicy = null;
          if (toReplace) {
            logger.warn(`Overwrites existing file '${file.relative}' with a new one designed for Aurelia.`);
          } else {
            const oldRelative = file.relative;
            file.basename = file.basename + '__au-cli';
            logger.warn(`Keeps existing file '${oldRelative}'. New file '${file.relative}' is created. You may need to update existing contents to work with Aurelia.`);
          }
          cb(null, file);
        });
        return;
      }
    }

    cb(null, file);
  });
}

// Special treatment of 'project.csproj' file
function skipDotnetCsprojIfExists(targetFolder) {
  let hasCsproj = false;
  try {
    hasCsproj = _.find(fs.readdirSync(targetFolder), f => f.endsWith('.csproj'));
  } catch (e) {
    //
  }

  return through2.obj((file, enc, cb) => {
    if (file.isBuffer() && hasCsproj && file.relative === 'project.csproj') {
      // skip 'project.csproj' file
      cb();
      return;
    }

    cb(null, file);
  });
}

function instructionsForSkippedFiles(targetFolder) {
  const skipped = [];
  const instructions = {};

  return through2.obj(
    // capture
    (file, enc, cb) => {
      if (file.isBuffer()) {
        if (file.writePolicy === 'skip' && fs.isFile(path.join(targetFolder, file.relative))) {
          // This file is to be skipped
          skipped.push(file.relative);
        }
        if (file.basename.endsWith('__instructions')) {
          instructions[file.relative.slice(0, -14)] = file.contents.toString('utf8');
          // remove instruction files
          cb();
          return;
        }
      }
      cb(null, file);
    },
    // flush
    cb => {
      const text = _(instructions).pick(skipped).values().join('\n');
      if (!text) {
        cb();
        return;
      }

      const instFileName = 'instructions.txt';
      logger.warn('Manual changes are necessary:\n');
      console.log(text + '\n');
      logger.info(`If you would like to do this at a later time, we've written these instructions to a file called '${instFileName}' in the project directory for you.\n`);

      const cwd = process.cwd();
      const base = path.join(cwd, targetFolder);
      const instFile = new Vinyl({
        cwd,
        base,
        path: path.join(base, instFileName),
        contents: Buffer.from(text)
      });
      cb(null, instFile);
    }
  );
}

async function askQuestion(relativePath) {
  const {decision} = await prompt({
    type: 'select',
    name: 'decision',
    initial: 'keep',
    message: `An existing file named '${relativePath}' was found. What would you like to do?`,
    choices: prettyChoices({
      value: 'keep',
      message: 'Keep the existing file',
      hint: `Keeps your existing file. New file will be created as '${relativePath}__au-cli'. You may need to update existing contents to work with Aurelia.`
    }, {
      value: 'replace',
      message: 'Replace the existing file ',
      hint: 'Replaces the existing file with a new one designed for Aurelia.'
    })
  });

  return decision === 'replace';
}
