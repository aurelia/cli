describe('The project-item module', () => {
  let mockfs;

  let fs;

  let ProjectItem;
  let project;

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
      project = new ProjectItem();
    });

    describe('isDirectory = true', () => {
      beforeEach(() => {
        project.isDirectory = true;
      });

      it('creates a directory if it is missing', done => {
        project.name = 'cli-app';
        project.create()
          .then(() => fs.readdir(project.name))
          .then(files => {
            expect(files).toBeDefined();
          }).catch(fail).then(done);
      });

      it('creates the childs', done => {
        const ui = {};
        const child = { create: () => { } };
        project.children.push(child);
        spyOn(child, 'create');

        project.name = 'cli-app';
        project.create(ui)
          .then(() => {
            expect(child.create).toHaveBeenCalledWith(ui, project.name);
          })
          .catch(fail).then(done);
      });
    });
  });

  describe('The _write() function', () => {
    beforeEach(() => {
      project = new ProjectItem();
    });
    it('creates non-existing files', done => {
      const file = {
        path: 'index.html',
        content: '<html></html>',
      };

      project._write(file.path, file.content)
        .then(() => fs.readFile(file.path))
        .then(content => {
          expect(content).toBe(file.content);
        }).catch(fail).then(done);
    });
    
    describe('in `skip` strategy', () => {
      beforeEach(() => {
        project._fileExistsStrategy = 'skip';
      });

      it('does not override an existing file', done => {
        const file = {
          path: 'index.html',
          content: '<html></html>'
        };

        fs.writeFile(file.path, file.content)
          .then(() => project._write(file.path, 'evil'))
          .then(() => fs.readFile(file.path))
          .then(content => {
            expect(content).toBe(file.content);
          }).catch(fail).then(done);
      });
    });
  });
});