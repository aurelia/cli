describe('The cli', () => {
  let fs;
  let path;
  let mockfs;
  let cli;
  let Project;
  let project;

  let dir;
  let aureliaProject;

  beforeEach(() => {
    fs = require('../../lib/file-system');
    path = require('path');
    cli = new (require('../../lib/cli').CLI)();
    Project = require('../../lib/project').Project;
    mockfs = require('mock-fs');
    project = {};

    dir = 'workspaces';
    aureliaProject = 'aurelia_project';
    const fsConfig = {};
    fsConfig[dir] = {};
    fsConfig['package.json'] = '{"version": "1.0.0"}';
    mockfs(fsConfig);
  });

  afterEach(() => {
    mockfs.restore();
  });

  describe('The _establishProject() function', () => {
    let establish;

    beforeEach(() => {
      establish = spyOn(Project, 'establish').and.returnValue(project);
    });

    it('resolves to nothing', done => {
      cli._establishProject({})
        .then(proj => {
          expect(proj).not.toBeDefined();
        })
        .catch(fail).then(done);
    });

    it('calls and resolves to Project.establish()', done => {
      fs.mkdirp(path.join(process.cwd(), aureliaProject))
        .then(() => cli._establishProject({
          runningLocally: true
        }))
        .then(proj => {
          expect(Project.establish)
            .toHaveBeenCalledWith(path.join(process.cwd()));
          expect(proj).toBe(proj);
        })
        .catch(fail).then(done);
    });

    it('does not catch Project.establish()', done => {
      establish.and.callFake(() => new Promise((resolve, reject) => reject()));

      fs.mkdirp(path.join(process.cwd(), aureliaProject))
        .then(() => cli._establishProject({
          runningLocally: true
        }))
        .then(() => {
          fail('expected promise to be rejected.');
          done();
        })
        .catch(done);
    });

    it('logs \'No Aurelia project found.\'', done => {
      spyOn(cli.ui, 'log');
      cli._establishProject({
        runningLocally: true
      }).then(() => {
        expect(cli.ui.log).toHaveBeenCalledWith('No Aurelia project found.');
      }).catch(fail).then(done);
    });
  });

  describe('The createHelpCommand() function', () => {
    it('gets the help command', () => {
      mockfs({
        'lib/commands/help/command.js': 'module.exports = {}'
      });
      spyOn(cli.container, 'get');

      cli.createHelpCommand();
      expect(cli.container.get)
        .toHaveBeenCalledWith(require('../../lib/commands/help/command'));
    });
  });

  describe('The configureContainer() function', () => {
    it('registers the instances', () => {
      const registerInstanceSpy = spyOn(cli.container, 'registerInstance');

      cli.configureContainer();

      expect(registerInstanceSpy.calls.count()).toBe(2);
    });
  });

  describe('The run() function', () => {
    function getVersionSpec(command) {
      return () => {
        beforeEach(() => {
          spyOn(cli.ui, 'log')
            .and.callFake(() => new Promise(resolve => resolve()));
        });

        it('logs the cli version', () => {
          cli.run(command);
          expect(cli.ui.log).toHaveBeenCalledWith('Local aurelia-cli v1.0.0');
        });

        it('returns an empty promise', done => {
          cli.run(command).then(resolved => {
            expect(resolved).not.toBeDefined();
          }).catch(fail).then(done);
        });
      };
    }

    describe('The --version arg', getVersionSpec('--version'));

    describe('The -v arg', getVersionSpec('-v'));

    it('uses the _establishProject() function', done => {
      // const project = {};
      spyOn(cli, '_establishProject').and.returnValue(new Promise(resolve => {
        resolve(project);
      }));
      spyOn(cli.container, 'registerInstance');
      spyOn(cli, 'createCommand').and.returnValue(Promise.resolve({ execute: () => {} }));

      cli.run()
        .then(() => {
          expect(cli._establishProject).toHaveBeenCalled();
        }).catch(fail).then(done);
    });

    it('registers the project instance', done => {
      cli.options.runningLocally = true;

      spyOn(cli, '_establishProject').and.returnValue(new Promise(resolve => {
        resolve(project);
      }));

      spyOn(cli.container, 'registerInstance');
      spyOn(cli, 'createCommand').and.returnValue(Promise.resolve({ execute: () => {} }));

      cli.run().then(() => {
        expect(cli.container.registerInstance)
          .toHaveBeenCalledWith(Project, project);
      }).catch(fail).then(done);
    });

    it('creates the command', done => {
      const command = 'run';
      const args = {};
      spyOn(cli, 'createCommand').and.returnValue(Promise.resolve({ execute: () => {} }));

      cli.run(command, args).then(() => {
        expect(cli.createCommand).toHaveBeenCalledWith(command, args);
      }).catch(fail).then(done);
    });

    it('executes the command', done => {
      const command = {
        execute: jasmine.createSpy('execute').and.returnValue(Promise.resolve({}))
      };
      const args = {};
      spyOn(cli, '_establishProject').and.returnValue(Promise.resolve(project));
      spyOn(cli, 'createCommand').and.returnValue(Promise.resolve(command));

      cli.run('run', args).then(() => {
        expect(command.execute).toHaveBeenCalledWith(args);
      }).catch(fail).then(done);
    });

    it('fails gracefully when Aurelia-CLI is ran from a root folder (non-project directory)', done => {
      cli.options.runningLocally = true;
      const command = {
        execute: jasmine.createSpy('execute').and.returnValue(Promise.resolve({}))
      };
      const args = {};
      spyOn(cli, '_establishProject').and.returnValue(Promise.resolve(null)); // no project could be found
      spyOn(cli, 'createCommand').and.returnValue(Promise.resolve(command));
      const errorSpy = spyOn(cli.ui, 'log');

      cli.run('', args).then(() => {
        expect(command.execute).not.toHaveBeenCalledWith(args);
        expect(errorSpy).toHaveBeenCalledTimes(2);
        expect(errorSpy.calls.first().args[0]).toContain('Local aurelia-cli');
        expect(errorSpy.calls.argsFor(1)[0]).toContain('It appears that the Aurelia CLI is running locally');
      }).catch(fail).then(done);
    });
  });

  describe('The config command', () => {
    it('creates the command', done => {
      const command = 'config';
      const args = {};
      spyOn(cli, 'createCommand').and.returnValue(Promise.resolve({ execute: () => {} }));

      cli.run(command, args).then(() => {
        expect(cli.createCommand).toHaveBeenCalledWith(command, args);
      }).catch(fail).then(done);
    });

    it('executes the command', done => {
      const command = {
        execute: jasmine.createSpy('execute').and.returnValue(Promise.resolve({}))
      };
      const args = {};
      spyOn(cli, '_establishProject').and.returnValue(new Promise(resolve =>
        resolve(project)
      ));
      spyOn(cli, 'createCommand').and.returnValue(Promise.resolve(command));

      cli.run('config', args).then(() => {
        expect(command.execute).toHaveBeenCalledWith(args);
      }).catch(fail).then(done);
    });
  });
});
