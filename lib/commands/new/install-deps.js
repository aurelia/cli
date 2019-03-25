const fs = require('../../file-system');
const logger = require('aurelia-logging').getLogger('install-deps');
const Yarn = require('../../package-managers/yarn').Yarn;
const NPM = require('../../package-managers/npm').NPM;

exports.choosePackageManager = async function(packageManager, projectFolder, ui) {
  if (packageManager === 'yarn' || packageManager === 'npm') return packageManager;

  const npmLockExists = fs.existsSync(fs.join(projectFolder, 'package-lock.json'));
  const yarnLockExists = fs.existsSync(fs.join(projectFolder, 'yarn.lock'));

  if (npmLockExists && yarnLockExists) {
    logger.warn("Found lock files for both npm and yarn! Lock files are not cross compatible between package managers. It's recommended to remove either package-lock.json (NPM) or yarn.lock (Yarn) from the project directory before installing new packages.\n");
  } else if (npmLockExists) {
    logger.info('Found NPM lock file. Recommend continued use of npm as package manager.\n');
  } else if (yarnLockExists) {
    logger.info('Found Yarn lock file. Recommend continued use of yarn as package manager.\n');
  }

  let defaultIndex = 0;
  let options = [];
  const yarn = new Yarn();
  if (yarn.isAvailable(projectFolder)) {
    if (!yarnLockExists) {
      logger.info('Lock files are not cross compatible between package managers. Choose Yarn here only if you intend to use Yarn for future package installs. Alternatively, remove either yarn.lock or package-lock.json from the project directory before installing new packages.\n');
    }
    if (npmLockExists && !yarnLockExists) {
      defaultIndex = 1;
    }
    options = [
      {
        message: 'Yes, use Yarn',
        hint: 'Installs all server, client and tooling dependencies needed to build the project using Yarn.',
        value: 'yarn'
      },
      {
        message: 'Yes, use NPM',
        hint: 'Installs all server, client and tooling dependencies needed to build the project using NPM.',
        value: 'npm'
      },
      {
        message: 'No',
        hint: 'Completes the new project wizard without installing dependencies.',
        value: 'no'
      }
    ];
  } else {
    options = [
      {
        message: 'Yes',
        hint: 'Installs all server, client and tooling dependencies needed to build the project.',
        value: 'yes'
      },
      {
        message: 'No',
        hint: 'Completes the new project wizard without installing dependencies.',
        value: 'no'
      }
    ];
  }

  const answer = await ui.question(
    'Would you like to install all the npm dependencies?',
    options,
    defaultIndex
  );

  if (answer === 'yes' || answer === 'npm' || answer === 'yarn') {
    return answer === 'yes' ? 'npm' : answer;
  }
};

exports.installDeps = async function(packageManager, projectFolder) {
  if (packageManager === 'yarn') {
    const yarn = new Yarn();
    try {
      await yarn.install([], projectFolder);
      return;
    } catch (e) {
      logger.error('Something went wrong while attempting to use Yarn. Falling back to NPM');
      logger.info(e);
    }
  }

  const npm = new NPM();
  await npm.install([], projectFolder);
};
