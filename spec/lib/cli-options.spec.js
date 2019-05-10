describe('The cli-options', () => {
  let cliOptions;
  let mockfs;

  beforeEach(() => {
    mockfs = require('mock-fs');
    const fsConfig = {
      'aurelia_project/environments/dev.js': 'content',
      'aurelia_project/environments/stage.js': 'content',
      'aurelia_project/environments/prod.js': 'content'
    };
    mockfs(fsConfig);

    cliOptions = new(require('../../lib/cli-options').CLIOptions)();
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
    mockfs.restore();
  });

  describe('The CLIOptions', () => {
    it('gets the right task name', () => {
      const paths = [
        'C:\\some\path to\\project\\aurelia_project\\tasks\\',
        '/some/path to/project/aurelia_project/tasks/'
      ];
      const files = {
        'run.ts': 'run',
        'run.js': 'run'
      };
      for (let path of paths) {
        for (let file of Object.keys(files)) {
          cliOptions.taskPath = `${path}${file}`;
          expect(cliOptions.taskName()).toBe(files[file]);
        }
      }
    });

    it('gets env from arg --env', () => {
      cliOptions.args = ['build', '--env', 'prod'];
      expect(cliOptions.getEnvironment()).toBe('prod');
    });

    it('gets env from NODE_ENV', () => {
      process.env.NODE_ENV = 'dev';
      cliOptions.args = ['build'];
      expect(cliOptions.getEnvironment()).toBe('dev');
    });

    it('normalizes env from production to prod', () => {
      cliOptions.args = ['build', '--env', 'production'];
      expect(cliOptions.getEnvironment()).toBe('prod');
    });

    it('does not normalizes env from production to prod if production.js is defined', () => {
      const fsConfig = {
        'aurelia_project/environments/development.js': 'content',
        'aurelia_project/environments/stage.js': 'content',
        'aurelia_project/environments/production.js': 'content'
      };
      mockfs(fsConfig);
      cliOptions.args = ['build', '--env', 'production'];
      expect(cliOptions.getEnvironment()).toBe('production');
    });

    it('normalizes env from development to dev', () => {
      cliOptions.args = ['build', '--env', 'development'];
      expect(cliOptions.getEnvironment()).toBe('dev');
    });

    it('does not normalizes env from development to dev if development.js is defined', () => {
      const fsConfig = {
        'aurelia_project/environments/development.js': 'content',
        'aurelia_project/environments/stage.js': 'content',
        'aurelia_project/environments/production.js': 'content'
      };
      mockfs(fsConfig);
      cliOptions.args = ['build', '--env', 'development'];
      expect(cliOptions.getEnvironment()).toBe('development');
    });

    it('terminates when env is not defined by an env file', () => {
      let oldExit = process.exit;
      let spy = jasmine.createSpy('exit');
      process.exit = spy;

      cliOptions.args = ['build', '--env', 'unknown'];
      cliOptions.getEnvironment();
      expect(spy).toHaveBeenCalledWith(1);
      process.exit = oldExit;
    });

    it('normalizes NODE_ENV from production to prod', () => {
      process.env.NODE_ENV = 'production';
      cliOptions.args = ['build'];
      expect(cliOptions.getEnvironment()).toBe('prod');
    });

    it('does not normalizes NODE_ENV from production to prod if production.js is defined', () => {
      const fsConfig = {
        'aurelia_project/environments/development.js': 'content',
        'aurelia_project/environments/stage.js': 'content',
        'aurelia_project/environments/production.js': 'content'
      };
      mockfs(fsConfig);
      process.env.NODE_ENV = 'production';
      cliOptions.args = ['build'];
      expect(cliOptions.getEnvironment()).toBe('production');
    });

    it('normalizes NODE_ENV from development to dev', () => {
      process.env.NODE_ENV = 'development';
      cliOptions.args = ['build'];
      expect(cliOptions.getEnvironment()).toBe('dev');
    });

    it('does not normalizes env from development to dev if development.js is defined', () => {
      const fsConfig = {
        'aurelia_project/environments/development.js': 'content',
        'aurelia_project/environments/stage.js': 'content',
        'aurelia_project/environments/production.js': 'content'
      };
      mockfs(fsConfig);
      process.env.NODE_ENV = 'development';
      cliOptions.args = ['build'];
      expect(cliOptions.getEnvironment()).toBe('development');
    });

    it('terminates when NODE_ENV is not defined by an env file', () => {
      let oldExit = process.exit;
      let spy = jasmine.createSpy('exit');
      process.exit = spy;

      process.env.NODE_ENV = 'unknown';
      cliOptions.args = ['build'];
      cliOptions.getEnvironment();
      expect(spy).toHaveBeenCalledWith(1);
      process.exit = oldExit;
    });
  });
});
