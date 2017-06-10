'use strict';

const path = require('path');
const PackageAnalyzer = require('../../../lib/build/package-analyzer').PackageAnalyzer;

describe('The PackageAnalyzer', () => {
  let mockfs;
  let project;
  let sut;

  beforeEach(() => {
    mockfs = require('mock-fs');

    project = {
      paths: {
        root: './src/'
      }
    };

    sut = new PackageAnalyzer(project);

    const fsConfig = {};
    mockfs(fsConfig);
  });

  afterEach(() => {
    mockfs.restore();
  });

  it('sets source to npm when node_modules is found in the path', done => {
    // setup mock package.json
    const fsConfig = {};
    fsConfig[path.join('node_modules/my-package', 'package.json')] = '{ }';
    mockfs(fsConfig);

    let loaderConfig = {
      name: 'my-package',
      path: '../node_modules/my-package'
    };

    sut.reverseEngineer(loaderConfig)
    .then(description => {
      expect(description.source).toBe('npm');
      expect(description.loaderConfig).toBe(loaderConfig);
      done();
    })
    .catch(e => done.fail(e));
  });

  it('sets source to custom when node_modules is not found in the path', done => {
    // setup mock package.json
    const fsConfig = {};
    fsConfig[path.join('some-folder/my-package', 'package.json')] = '{ }';
    mockfs(fsConfig);

    let loaderConfig = {
      name: 'my-package',
      path: '../some-folder/my-package',
      packageRoot: '../some-folder/my-package'
    };

    sut.reverseEngineer(loaderConfig)
    .then(description => {
      expect(description.source).toBe('custom');
      expect(description.loaderConfig).toBe(loaderConfig);
      done();
    })
    .catch(e => done.fail(e));
  });

  it('creates description when there is no package.json', done => {
    const fsConfig = {};
    mockfs(fsConfig);

    let loaderConfig = {
      name: 'my-package',
      path: '../some-folder/my-package',
      packageRoot: '../some-folder/my-package'
    };

    sut.reverseEngineer(loaderConfig)
    .then(description => {
      expect(description.source).toBe('custom');
      expect(description.loaderConfig).toBe(loaderConfig);
      done();
    })
    .catch(e => done.fail(e));
  });

  it('reads package.json as package metadata', done => {
    // setup mock package.json
    const fsConfig = {};
    fsConfig[path.join('some-folder/my-package', 'package.json')] = '{ "name": "my-package" }';
    mockfs(fsConfig);

    let loaderConfig = {
      name: 'my-package',
      path: '../some-folder/my-package',
      packageRoot: '../some-folder/my-package'
    };

    sut.reverseEngineer(loaderConfig)
    .then(description => {
      expect(description.metadata.name).toBe('my-package');
      done();
    })
    .catch(e => done.fail(e));
  });

  it('analyze() reads package.json as package metadata', done => {
    // setup mock package.json
    // setup mock package.json
    const fsConfig = {};
    fsConfig[path.join('node_modules/my-package', 'package.json')] = '{ "name": "my-package", "main": "index.js" }';
    fsConfig[path.join('node_modules/my-package', 'index.js')] = 'some-content';
    fsConfig[project.paths.root] = {};
    mockfs(fsConfig);

    sut.analyze('my-package')
    .then(description => {
      expect(description.metadata.name).toBe('my-package');
      done();
    })
    .catch(e => done.fail(e));
  });

  it('analyze() determines loaderConfig', done => {
    // setup mock package.json
    const fsConfig = {};
    fsConfig[path.join('node_modules/my-package', 'package.json')] = '{ "name": "my-package", "main": "index.js" }';
    fsConfig[path.join('node_modules/my-package', 'index.js')] = 'some-content';
    fsConfig[project.paths.root] = {};
    mockfs(fsConfig);

    sut.analyze('my-package')
    .then(description => {
      expect(description.loaderConfig.name).toBe('my-package');
      expect(description.loaderConfig.path).toBe(path.join('..', 'node_modules', 'my-package', 'index'));
      done();
    })
    .catch(e => done.fail(e));
  });

  it('analyze() uses jspm.directories.dist and jspm.main path if available', done => {
    // setup mock package.json
    const fsConfig = {};
    let json = '{ "name": "my-package", "main": "index.js", "jspm": { "directories": { "dist": "foobar" }, "main": "my-main.js" } }';
    fsConfig[path.join('node_modules/my-package/foobar', 'my-main.js')] = 'some-content';
    fsConfig[path.join('node_modules/my-package', 'package.json')] = json;
    fsConfig[project.paths.root] = {};
    mockfs(fsConfig);

    sut.analyze('my-package')
    .then(description => {
      expect(description.loaderConfig.name).toBe('my-package');
      expect(description.loaderConfig.path).toBe(path.join('..', 'node_modules', 'my-package', 'foobar', 'my-main'));
      done();
    })
    .catch(e => done.fail(e));
  });

  it('infers index.js as main file where package.json has no main property', done => {
    // setup mock package.json
    const fsConfig = {};
    let json = '{ "name": "my-package" }';
    fsConfig[path.join('node_modules/my-package', 'package.json')] = json;
    fsConfig[path.join('node_modules/my-package', 'index.js')] = 'some-content';
    fsConfig[project.paths.root] = {};
    mockfs(fsConfig);

    sut.analyze('my-package')
    .then(description => {
      expect(description.loaderConfig.name).toBe('my-package');
      expect(description.loaderConfig.path).toBe('..\\node_modules\\my-package\\index');
      done();
    })
    .catch(e => done.fail(e));
  });

  it('analyze() works when there is no package.json. Uses index.js as the main file', done => {
    // setup mock package.json
    const fsConfig = {};
    fsConfig[path.join('node_modules/my-package')] = {};
    fsConfig[path.join('node_modules/my-package', 'index.js')] = 'some-content';
    fsConfig[project.paths.root] = {};
    mockfs(fsConfig);

    sut.analyze('my-package')
    .then(description => {
      expect(description.loaderConfig.name).toBe('my-package');
      expect(description.loaderConfig.path).toBe(path.join('..', 'node_modules', 'my-package', 'index'));
      done();
    })
    .catch(e => done.fail(e));
  });

  it('analyze() throws error when main file does not exist', done => {
    // setup mock package.json
    const fsConfig = {};
    fsConfig[path.join('node_modules', 'my-package', 'package.json')] = '{ "main": "foo.js" }';
    fsConfig[project.paths.root] = {};
    mockfs(fsConfig);

    let p = path.resolve(path.join('node_modules', 'my-package', 'foo.js'));

    sut.analyze('my-package')
    .then(() => done.fail('should have thrown an exception'))
    .catch(e => {
      expect(e.message).toBe(`The "my-package" package references a main file that does not exist: ${p}`);
      done();
    });
  });
});
