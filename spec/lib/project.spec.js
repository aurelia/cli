describe('The project module', () => {
  let mockfs;
  let path;

  let fs;

  let Project;
  let project;

  beforeEach(() => {
    mockfs = require('mock-fs');
    path = require('path');

    fs = require('../../lib/file-system');

    Project = require('../../lib/project').Project;

    mockfs();

    project = new Project('', {
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

    project = new Project('', model);

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

  it('The makeFileName() function', () => {
    expect(project.makeFileName('Foo'), 'foo');
    expect(project.makeFileName('foo'), 'foo');
    expect(project.makeFileName('fooBar'), 'foo-bar');
    expect(project.makeFileName('foo-bar'), 'foo-bar');
    expect(project.makeFileName('FOO Bar'), 'foo-bar');
    expect(project.makeFileName('_foo_bar_'), 'foo-bar');
  });

  it('The makeClassName() function', () => {
    expect(project.makeClassName('Foo'), 'Foo');
    expect(project.makeClassName('foo'), 'foo');
    expect(project.makeClassName('fooBar'), 'FooBar');
    expect(project.makeClassName('foo-bar'), 'FooBar');
    expect(project.makeClassName('FOO Bar'), 'FooBar');
    expect(project.makeClassName('_foo_bar_'), 'FooBar');
  });

  it('The makeFunctionName() function', () => {
    expect(project.makeFunctionName('Foo'), 'foo');
    expect(project.makeFunctionName('foo'), 'foo');
    expect(project.makeFunctionName('fooBar'), 'fooBar');
    expect(project.makeFunctionName('foo-bar'), 'fooBar');
    expect(project.makeFunctionName('FOO Bar'), 'fooBar');
    expect(project.makeFunctionName('_foo_bar_'), 'fooBar');
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
