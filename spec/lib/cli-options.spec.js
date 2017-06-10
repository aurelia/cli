"use strict";
describe('The cli-options', () => {
  let cliOptions;

  beforeEach(() => {
    cliOptions = new(require('../../lib/cli-options').CLIOptions)();
  });

  describe('The CLIOptions', () => {
    it('gets the right task name', () => {
      const paths = [
        "C:\\some\path to\\project\\aurelia_project\\tasks\\",
        "/some/path to/project/aurelia_project/tasks/"
      ];
      const files = {
        "run.ts": "run",
        "run.js": "run"
      };
      for (let path of paths) {
        for (let file of Object.keys(files)) {
          cliOptions.taskPath = `${path}${file}`;
          expect(cliOptions.taskName()).toBe(files[file]);
        }
      }
    });
  });
});
