const Task = require('./task');
const { killProc } = require('../utils');
const { spawn } = require('child_process');
const os = require('os');

module.exports = class ExecuteCommand extends Task {
  constructor(command, parameters, outputCallback, errorCallback, closeCallback) {
    super('Execute command');

    this.command = command;
    this.ignoreStdErr = false;
    this.parameters = parameters;
    this.outputCallback = outputCallback;
    this.errorCallback = errorCallback;
    this.closeCallback = closeCallback;

    if (!this.errorCallback) {
      this.errorCallback = () => this.stop();
    }
    if (!this.closeCallback) {
      this.closeCallback = () => this.stop();
    }
  }

  execute() {
    this.proc = spawn(this.command, this.parameters);
    this.promise = new Promise((resolve) => {
      this.resolve = resolve;
    });

    this.proc.stdout.on('data', (data) => {
      this.outputCallback(this.stripANSI(data.toString()));
    });

    this.proc.stderr.on('data', (data) => {
      if (!this.ignoreStdErr) {
        this.outputCallback(this.stripANSI(data.toString()));
        this.errorCallback(this.stripANSI(data.toString()));
      }
    });

    this.proc.on('close', (code) => {
      this.closeCallback(code);
    });

    return this.promise;
  }

  stripANSI(input) {
    return input.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
  }

  executeAsNodeScript() {
    if (os.platform() === 'win32' && !this.command.endsWith('.cmd')) {
      this.command += '.cmd';
    }

    return this.execute();
  }

  stop() {
    this.resolve();
    killProc(this.proc);
  }

  getTitle() {
    return super.getTitle() + ` (command: ${this.command} ${this.parameters.join(' ')})`;
  }
};
