describe('The project module', () => {
  let mockfs;
  let path;

  let fs;
  let ui;

  let Project;
  let project;

  beforeEach(() => {
    mockfs = require('mock-fs');
    path = require('path');

    fs = require('../../lib/file-system');
    ui = new (require('../../lib/ui').ConsoleUI)();

    Project = require('../../lib/project').Project;

    mockfs();
    
    project = new Project(ui, '', {
      paths: { },
      transpiler: {
        fileExtension: '.js'
      }
    });
  });

  afterEach(() => {
    mockfs.restore();
  });

  describe('The resolveGenerator() function', () => {
    it('resolves to teh generators location', done => {
      fs.writeFile('aurelia_project/generators/test.js', '')
        .then(() => project.resolveGenerator('test'))
        .then(location => {
          expect(location).toBe(path.join('aurelia_project', 'generators', 'test.js'));
        }).catch(fail).then(done);
    });

    it('resolves to null', done => {
      project.resolveGenerator('test')
        .then(location => {
          expect(location).toBe(null);
        }).catch(fail).then(done);
    });
  });

  describe('The resolveTask() function', () => {
    it('resolves to the tasks location', done => {
      fs.writeFile('aurelia_project/tasks/test.js', '')
        .then(() => project.resolveTask('test'))
        .then(location => {
          expect(location).toBe(path.join('aurelia_project', 'tasks', 'test.js'));
        }).catch(fail).then(done);
    });

    it('resolves to null', done => {
      project.resolveTask('test')
        .then(location => {
          expect(location).toBe(null);
        }).catch(fail).then(done);
    });
  });
});