const Task = require('./task');
const ExecuteCommand = require('./execute-command');
const fs = require('fs');
const path = require('path');

module.exports = class DotNetNewWeb extends Task {
  constructor() {
    super('dotnet new web');
  }

  execute(context) {
    if (fs.existsSync(path.join(context.workingDirectory, 'Startup.cs'))) {
      this.logger.info('Startup.cs exists in project directory, skipping dotnet new');
      return Promise.resolve();
    }

    this.executeCommand = new ExecuteCommand('dotnet', ['new', 'web', '--force']);
    return this.executeCommand.execute();
  }
};
