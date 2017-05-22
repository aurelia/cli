'use strict';

describe('The project-item module', () => {
  let mockfs;

  let fs;

  let ProjectItem;
  let projectItem;

  beforeEach(() => {
    mockfs = require('mock-fs');

    fs = require('../../lib/file-system');

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

        parent.create()
        .then(() => {
          projectItem.create(null, '.')
            .then(() => fs.readdir('src'))
            .then(files => {
              expect(files[0]).toBe('resources');
            })
            .then(done);
        })
        .catch(e => done.fail(e));
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

      it('creates the childs', done => {
        const ui = {};
        const child = { create: () => { } };
        projectItem.children.push(child);
        spyOn(child, 'create');

        projectItem.name = 'cli-app';
        projectItem.create(ui)
          .then(() => {
            expect(child.create).toHaveBeenCalledWith(ui, projectItem.name);
          })
          .then(done)
          .catch(e => done.fail(e));
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
  });
});
