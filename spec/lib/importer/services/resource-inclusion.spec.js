'use strict';

describe('The ResourceInclusion module', () => {
  let mockfs;
  let ResourceInclusion;
  let sut;
  let container;
  let pkg;
  let project;

  beforeEach(() => {
    mockfs = require('mock-fs');

    container = new (require('aurelia-dependency-injection').Container)();
    const FakeUI = require('../../../mocks/ui');
    const UI = require('../../../../lib/ui');

    pkg = {
      rootPath: 'node_modules/some-package',
      path: '../node_modules/some-package'
    };

    project = {
      model: {
        paths: {
          root: 'src'
        }
      }
    };

    container.registerInstance('package', pkg);
    container.registerInstance('project', project);
    container.registerAlias(FakeUI, UI);

    ResourceInclusion = require('../../../../lib/importer/services/resource-inclusion');

    sut = container.get(ResourceInclusion);

    mockfs({
      node_modules: {
        'some-package': {
          dist: {
            'test.css': 'body { background-color: red }',
            css: {
              'test.css': 'body { background-color: red }'
            }
          }
        }
      }
    });
  });

  describe('getResources', () => {
    it('returns resources directly under package path (dist folder)', (done) => {
      pkg.path = '../node_modules/some-package/dist';
      sut.getResources('*.css')
      .then(result => {
        expect(result[0]).toBe('test.css');
        done();
      })
      .catch(e => done.fail());
    });

    it('supports deeper folder structure', (done) => {
      pkg.path = '../node_modules/some-package/dist';
      sut.getResources('?(dist|build|lib|css|style|styles)/*.css')
      .then(result => {
        expect(result[0]).toBe('css/test.css');
        done();
      })
      .catch(e => done.fail());
    });
  });

  afterEach(() => {
    mockfs.restore();
  });
});
