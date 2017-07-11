'use strict';

describe('The ResourceInclusion module', () => {
  let mockfs;
  let ResourceInclusion;
  let sut;
  let container;
  let pkg;

  beforeEach(() => {
    mockfs = require('mock-fs');

    container = new (require('aurelia-dependency-injection').Container)();
    const FakeUI = require('../../../mocks/ui');
    const UI = require('../../../../lib/ui');

    pkg = {
      rootPath: 'node_modules/some-package',
      path: '../node_modules/some-package'
    };

    container.registerInstance('package', pkg);
    container.registerAlias(FakeUI, UI);

    ResourceInclusion = require('../../../../lib/importer/services/resource-inclusion');

    sut = container.get(ResourceInclusion);

    mockfs({
      node_modules: {
        'some-package': {
          dist: {
            'test.css': 'body { background-color: red }',
            output: {
              'test.css': 'body { background-color: red }'
            }
          }
        }
      }
    });
  });

  describe('getResources', () => {
    it('returns resource paths from package root', (done) => {
      sut.getResources('?(dist|build|lib|css|style|styles)/*.css')
      .then(result => {
        expect(result[0]).toBe('dist/test.css');
        done();
      })
      .catch(e => done.fail());
    });

    it('removes duplicate dist', (done) => {
      pkg.path = '../node_modules/some-package/dist';
      sut.getResources('?(dist|build|lib|css|style|styles)/*.css')
      .then(result => {
        expect(result[0]).toBe('test.css');
        done();
      })
      .catch(e => done.fail());
    });

    it('removes duplicate dist (deeper folder structure)', (done) => {
      pkg.path = '../node_modules/some-package/dist/output';
      sut.getResources('?(dist|build|lib|css|style|styles)/*.css')
      .then(result => {
        expect(result[0]).toBe('test.css');
        done();
      })
      .catch(e => done.fail());
    });
  });

  afterEach(() => {
    mockfs.restore();
  });
});
