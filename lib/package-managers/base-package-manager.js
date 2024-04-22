const {spawn} = require('child_process');
const npmWhich = require('npm-which');

exports.BasePackageManager = class {
  constructor(executableName) {
    this.executableName = executableName;
  }

  install(packages = [], workingDirectory = process.cwd(), command = 'install') {
    return this.run(command, packages, workingDirectory);
  }

  run(command, args = [], workingDirectory = process.cwd()) {
    const isWindows = process.platform === "win32";
    let executable = this.getExecutablePath(workingDirectory);
    let options = { stdio: "inherit", cwd: workingDirectory };
    if (isWindows) {
      executable = `"${executable}"`
      options = { ...options, shell: true }
    }

    return new Promise((resolve, reject) => {
      this.proc = spawn(
        executable,
        [command, ...args],
        options
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
