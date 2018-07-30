'use strict';

const path = require('path');

describe('The project-item module', () => {
  let mockfs;

  let fs;
  let ui;

  let ProjectItem;
  let projectItem;

  beforeEach(() => {
    mockfs = require('mock-fs');

    fs = require('../../lib/file-system');
    ui = new (require('../mocks/ui'));

    ProjectItem = require('../../lib/project-item').ProjectItem;

    mockfs();
  });

  afterEach(() => {
    mockfs.restore();
  });

  describe('The create() function', () => {
    beforeEach(() => {
      projectItem = new ProjectItem();
    });

    describe('isDirectory = true', () => {
      beforeEach(() => {
        projectItem.isDirectory = true;
      });

      it('takes parent directory into consideration', done => {
        let parent = ProjectItem.directory('src');
        projectItem.name = 'resources';
        projectItem.parent = parent;

        parent.create().then(() => {
          projectItem.create(null, '.')
            .then(() => fs.readdir('src'))
            .then(files => {
              expect(files[0]).toBe('resources');
            })
            .then(done);
        }).catch(e => done.fail(e));
      });

      it('creates a directory if it is missing', done => {
        projectItem.name = 'cli-app';
        projectItem.create()
          .then(() => fs.readdir(projectItem.name))
          .then(files => {
            expect(files).toBeDefined();
          })
          .then(done)
          .catch(e => done.fail(e));
      });

      it('creates the children in sequence', done => {
        let calls = [];

        let create1 = jasmine.createSpy('create1').and.callFake(() => new Promise(r => {
          setTimeout(() => {
            calls.push('create1');
            r();
          }, 200);
        }));
        let create2 = jasmine.createSpy('create2').and.callFake(() => new Promise(r => {
          setTimeout(() => {
            calls.push('create2');
            r();
          }, 400);
        }));
        let create3 = jasmine.createSpy('create3').and.callFake(() => new Promise(r => {
          setTimeout(() => {
            calls.push('create3');
            r();
          }, 0);
        }));

        projectItem.children.push({ create: create1 });
        projectItem.children.push({ create: create2 });
        projectItem.children.push({ create: create3 });

        projectItem.name = 'cli-app';
        projectItem.create(ui).then(() => {
          expect(calls[0]).toBe('create1');
          expect(calls[1]).toBe('create2');
          expect(calls[2]).toBe('create3');

          done();
        }).catch(e => done.fail(e));
      });
    });
  });

  describe('The _write() function', () => {
    beforeEach(() => {
      projectItem = new ProjectItem();
    });
    it('creates non-existing files', done => {
      const file = {
        path: 'index.html',
        content: '<html></html>'
      };

      projectItem._write(file.path, file.content)
        .then(() => fs.readFile(file.path))
        .then(content => {
          expect(content).toBe(file.content);
        })
        .then(done)
        .catch(e => done.fail(e));
    });

    describe('in `skip` strategy', () => {
      beforeEach(() => {
        projectItem._fileExistsStrategy = 'skip';
      });

      it('does not override an existing file', done => {
        const file = {
          path: 'index.html',
          content: '<html></html>'
        };

        fs.writeFile(file.path, file.content)
          .then(() => projectItem._write(file.path, 'evil'))
          .then(() => fs.readFile(file.path))
          .then(content => {
            expect(content).toBe(file.content);
          })
          .then(done)
          .catch(e => done.fail(e));
      });
    });

    describe('in `ask` strategy', () => {
      beforeEach(() => {
        projectItem._fileExistsStrategy = 'ask';
      });

      it('asks the user whether to replace the file or not if already present', done => {
        let fsConfig = {};
        fsConfig[path.resolve('./index.html')] = '<html></html>';
        mockfs(fsConfig);

        const file = {
          path: path.resolve('./index.html'),
          content: '<html></html>'
        };

        projectItem._write(file.path, '<html></html>', ui).then(() => {
          expect(ui.question).toHaveBeenCalled();
        }).then(done).catch(e => done.fail(e));
      });

      it('does not write file if user chooses not to replace the file', done => {
        let fsConfig = {};
        fsConfig[path.resolve('./index.html')] = '<html></html>';
        mockfs(fsConfig);

        spyOn(fs, 'writeFile');
        // choose the first option (Keep it)
        ui.question.and.callFake((question, answers) => {
          return Promise.resolve(answers[0]);
        });

        const file = {
          path: path.resolve('./index.html'),
          content: '<html></html>'
        };

        projectItem._write(file.path, '<html></html>', ui).then(() => {
          expect(fs.writeFile).not.toHaveBeenCalled();
        }).then(done).catch(e => done.fail(e));
      });
    });
  });
});
