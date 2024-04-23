const {spawn} = require('child_process');
const npmWhich = require('npm-which');
const isWindows = process.platform === "win32";

exports.BasePackageManager = class {
  constructor(executableName) {
    this.executableName = executableName;
  }

  install(packages = [], workingDirectory = process.cwd(), command = 'install') {
    return this.run(command, packages, workingDirectory);
  }

  run(command, args = [], workingDirectory = process.cwd()) {
    let executable = this.getExecutablePath(workingDirectory);
    if (isWindows) {
      executable = JSON.stringify(executable); // Add quotes around path
    }

    return new Promise((resolve, reject) => {
      this.proc = spawn(
        executable,
        [command, ...args],
        { stdio: "inherit", cwd: workingDirectory, shell: isWindows }
      )
        .on('close', resolve)
        .on('error', reject);
    });
  }

  getExecutablePath(directory) {
    try {
      return npmWhich(directory).sync(this.executableName);
    } catch (e) {
      return null;
    }
  }

  isAvailable(directory) {
    return !!this.getExecutablePath(directory);
  }
};

exports.default = exports.BasePackageManager;
