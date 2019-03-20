const os = require('os');
const childProcess = require('child_process');

function killProc(proc) {
  if (os.platform() === 'win32') {
    childProcess.exec('taskkill /pid ' + proc.pid + ' /T /F');
  } else {
    proc.stdin.pause();
    proc.kill();
  }
}

module.exports = {
  killProc
};

