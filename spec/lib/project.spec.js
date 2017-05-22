'use strict';

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

  it('creates project items for all paths in aurelia.json, using the root path as the parent directory', () => {
    let model = {
      paths: {
        'root': 'src',
        'resources': 'resources',
        'elements': 'resources/elements'
      }
    };

    project = new Project(ui, '', model);

    expect(hasProjectItem(project.locations, 'src', null)).toBe(true);
    expect(hasProjectItem(project.locations, 'resources', 'src')).toBe(true);
    expect(hasProjectItem(project.locations, 'resources/elements', 'src')).toBe(true);
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

function hasProjectItem(locations, name, parent) {
  for (let i = 0; i < locations.length; i++) {
    if (locations[i].name === name) {
      if (!parent && !locations[i].parent) {
        return true;
      }

      if (locations[i].parent && locations[i].parent.name === parent) {
        return true;
      }
    }
  }

  return false;
}
