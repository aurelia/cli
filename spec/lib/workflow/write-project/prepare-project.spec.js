const prepareProject = require('../../../../lib/workflow/write-project/prepare-project');
const {getSupportedVersion} = require('../../../../lib/dependencies');
const mockfs = require('mock-fs');
const through2 = require('through2');

const gatherFiles = function(box) {
  return through2.obj((file, enc, cb) => {
    if (file.isBuffer()) {
      box[file.relative.replace(/\\/g, '/')] = {
        contents: file.contents.toString('utf8'),
        writePolicy: file.writePolicy || null
      };
    }
    cb();
  });
};

describe('The prepareProject func', () => {
  beforeEach(() => {
    mockfs({});
  });

  afterEach(() => {
    mockfs.restore();
  });

  it('merges all features folders', done => {
    mockfs({
      'skeleton/common/file-a.js': 'file-a',
      'skeleton/feature1/file-b.js': 'file-b',
      'skeleton/feature1/folder/file-b2.js': 'file-b2',
      'skeleton/feature2/file-c.json': '{"file":"c"}',
      'skeleton/feature3/file-d.js': 'file-d'
    });

    const box = {};
    prepareProject('aurelia-app', ['feature1', 'feature2'], 'skeleton')
      .pipe(gatherFiles(box))
      .once('error', done)
      .on('finish', () => {
        expect(box).toEqual({
          'file-a.js': {contents: 'file-a', writePolicy: null},
          'file-b.js': {contents: 'file-b', writePolicy: null},
          'file-c.json': {contents: '{\n  "file": "c"\n}', writePolicy: null},
          'folder/file-b2.js': {contents: 'file-b2', writePolicy: null}
        });
        done();
      });
  });

  it('extracts write policy from file name', done => {
    mockfs({
      'skeleton/common/file-a.js__skip-if-exists': 'file-a',
      'skeleton/feature1/file-b.js': 'file-b',
      'skeleton/feature1/folder/file-b2.js__append-if-exists': 'file-b2',
      'skeleton/feature2/file-c.json__ask-if-exists': '{"file":"c"}',
      'skeleton/feature3/file-d.js': 'file-d'
    });

    const box = {};
    prepareProject('aurelia-app', ['feature1', 'feature2'], 'skeleton')
      .pipe(gatherFiles(box))
      .once('error', done)
      .on('finish', () => {
        expect(box).toEqual({
          'file-a.js': {contents: 'file-a', writePolicy: 'skip'},
          'file-b.js': {contents: 'file-b', writePolicy: null},
          'file-c.json': {contents: '{\n  "file": "c"\n}', writePolicy: 'ask'},
          'folder/file-b2.js': {contents: 'file-b2', writePolicy: 'append'}
        });
        done();
      });
  });

  it('filters by filename condition', done => {
    mockfs({
      'skeleton/common/.file-a.js__if_feature1_and_feature2': 'file-a',
      'skeleton/common/file-a2.js__if_feature3': 'file-a2',
      'skeleton/feature1/file-b.js__if_feature2': 'file-b',
      'skeleton/feature1/folder/file-b2.js__if_not_feature2_or_not_feature3': 'file-b2',
      'skeleton/feature1/folder/file-b3.js__if_not_feature3': 'file-b3',
      'skeleton/feature2/file-c.json': '{"file":"c"}',
      'skeleton/feature3/file-d.js': 'file-d'
    });

    const box = {};
    prepareProject('aurelia-app', ['feature1', 'feature2'], 'skeleton')
      .pipe(gatherFiles(box))
      .once('error', done)
      .on('finish', () => {
        expect(box).toEqual({
          '.file-a.js': {contents: 'file-a', writePolicy: null},
          'file-b.js': {contents: 'file-b', writePolicy: null},
          'file-c.json': {contents: '{\n  "file": "c"\n}', writePolicy: null},
          'folder/file-b2.js': {contents: 'file-b2', writePolicy: null},
          'folder/file-b3.js': {contents: 'file-b3', writePolicy: null}
        });
        done();
      });
  });

  it('filters by folder condition', done => {
    mockfs({
      'skeleton/common/f1__if_a/f2__if_b/app.js__if_c': 'app-abc',
      'skeleton/common/f1__if_a/f2__if_b/app.js__if_d': 'app-abd',
      'skeleton/common/f1__if_a/f2/main.js__if_b': 'main-ab',
      'skeleton/common/f1/f2__if_d/main.js__if_b': 'main-db'
    });

    const box = {};
    prepareProject('aurelia-app', ['a', 'b', 'c'], 'skeleton')
      .pipe(gatherFiles(box))
      .once('error', done)
      .on('finish', () => {
        expect(box).toEqual({
          'f1/f2/app.js': {contents: 'app-abc', writePolicy: null},
          'f1/f2/main.js': {contents: 'main-ab', writePolicy: null}
        });
        done();
      });
  });

  it('filters by filename conditioni, and extracts write policy from file name', done => {
    mockfs({
      'skeleton/common/file-a.js__if_feature1_and_feature2__skip-if-exists': 'file-a',
      'skeleton/common/file-a2.js__ask-if-exists__if_feature3': 'file-a2',
      'skeleton/feature1/file-b.js__ask-if-exists__if_feature2': 'file-b',
      'skeleton/feature1/folder/file-b2.js__if_not_feature2_or_not_feature3__append-if-exists': 'file-b2',
      'skeleton/feature1/folder/file-b3.js__if_not_feature3__append-if-exists': 'file-b3',
      'skeleton/feature2/file-c.json': '{"file":"c"}',
      'skeleton/feature3/file-d.js': 'file-d'
    });

    const box = {};
    prepareProject('aurelia-app', ['feature1', 'feature2'], 'skeleton')
      .pipe(gatherFiles(box))
      .once('error', done)
      .on('finish', () => {
        expect(box).toEqual({
          'file-a.js': {contents: 'file-a', writePolicy: 'skip'},
          'file-b.js': {contents: 'file-b', writePolicy: 'ask'},
          'file-c.json': {contents: '{\n  "file": "c"\n}', writePolicy: null},
          'folder/file-b2.js': {contents: 'file-b2', writePolicy: 'append'},
          'folder/file-b3.js': {contents: 'file-b3', writePolicy: 'append'}
        });
        done();
      });
  });


  it('preprocesses file content, with projectName and features', done => {
    const fileA = `// @if feat.feature1
feature1
// @endif
// @if feat.feature2
feature2
// @endif`;
    const fileB2 = `<template>
<!-- @if feat.feature2 && feat.feature3 -->
<p>feature3</p>
<!-- @endif -->
<!-- @if feat.feature2 -->
<p><!-- @echo projectName --></p>
<!-- @endif -->
</template>`;
    const fileC = `{
// @if feat.feature1
"feature1": true
// @endif
// @if feat.feature3
"feature3": true
// @endif
}`;
    mockfs({
      'skeleton/common/file-a.js__if_feature1_and_feature2': fileA,
      'skeleton/common/file-a2.js__if_feature3': 'file-a2',
      'skeleton/feature1/file-b.js__if_feature2': 'file-b',
      'skeleton/feature1/folder/file-b2.html__if_not_feature2_or_not_feature3': fileB2,
      'skeleton/feature1/folder/file-b3.js__if_not_feature3': 'file-b3',
      'skeleton/feature2/file-c.json': fileC,
      'skeleton/feature3/file-d.js': 'file-d'
    });

    const box = {};
    prepareProject('Aurelia App', ['feature1', 'feature2'], 'skeleton')
      .pipe(gatherFiles(box))
      .once('error', done)
      .on('finish', () => {
        expect(box).toEqual({
          'file-a.js': {contents: 'feature1\nfeature2\n', writePolicy: null},
          'file-b.js': {contents: 'file-b', writePolicy: null},
          'file-c.json': {contents: '{\n  "feature1": true\n}', writePolicy: null},
          'folder/file-b2.html': {contents: '<template>\n<p>aurelia-app</p>\n</template>', writePolicy: null},
          'folder/file-b3.js': {contents: 'file-b3', writePolicy: null}
        });
        done();
      });
  });

  it('Rename file.ext to file.js if feature babel is in use', done => {
    mockfs({
      'skeleton/common/file.ext': `// @if feat.babel
babel-file.js
// @endif
// @if feat.typescript
typescript-file.ts
// @endif
`,
      'skeleton/feature1/folder/foo.ext': `// @if feat.babel
babel-folder/foo.js
// @endif
// @if feat.typescript
typescript-folder/foo.ts
// @endif
`
    });

    const box = {};
    prepareProject('aurelia-app', ['feature1', 'babel'], 'skeleton')
      .pipe(gatherFiles(box))
      .once('error', done)
      .on('finish', () => {
        expect(box).toEqual({
          'file.js': {contents: 'babel-file.js\n', writePolicy: null},
          'folder/foo.js': {contents: 'babel-folder/foo.js\n', writePolicy: null}
        });
        done();
      });
  });

  it('Rename file.ext to file.ts if feature typescript is in use', done => {
    mockfs({
      'skeleton/common/file.ext': `// @if feat.babel
babel-file.js
// @endif
// @if feat.typescript
typescript-file.ts
// @endif
`,
      'skeleton/feature1/folder/foo.ext': `// @if feat.babel
babel-folder/foo.js
// @endif
// @if feat.typescript
typescript-folder/foo.ts
// @endif
`
    });

    const box = {};
    prepareProject('aurelia-app', ['feature1', 'typescript'], 'skeleton')
      .pipe(gatherFiles(box))
      .once('error', done)
      .on('finish', () => {
        expect(box).toEqual({
          'file.ts': {contents: 'typescript-file.ts\n', writePolicy: null},
          'folder/foo.ts': {contents: 'typescript-folder/foo.ts\n', writePolicy: null}
        });
        done();
      });
  });

  it('merges package.json', done => {
    mockfs({
      'skeleton/common/package.json': '{"name": "aurelia-app","dependencies":{"aurelia-cli":""}}',
      'skeleton/feature1/package.json': '{"dependencies":{"bar":"","foo":""}}',
      'skeleton/feature2/package.json': '{"dependencies":{"bar":"^2.1.3"}}'
    });

    const box = {};
    prepareProject('aurelia-app', ['feature1', 'feature2'], 'skeleton')
      .pipe(gatherFiles(box))
      .once('error', done)
      .on('finish', () => {
        expect(Object.keys(box)).toEqual(['package.json']);
        expect(box['package.json'].writePolicy).toBe(null);

        expect(JSON.parse(box['package.json'].contents)).toEqual({
          name: 'aurelia-app',
          dependencies: {
            'aurelia-cli': getSupportedVersion('aurelia-cli'),
            bar: '^2.1.3',
            foo: 'latest'
          }
        });
        done();
      });
  });

  it('merges aurelia.json', done => {
    mockfs({
      'skeleton/common/aurelia_project/aurelia.json': `
        {
          "name": "aurelia-app",
          "type": "project:application",
          "bundler": {
            "id": "cli",
            "displayName": "Aurelia-CLI"
          }
        }
      `,
      'skeleton/cli-bundler/aurelia_project/aurelia.json': `
        {
          // @if feat.babel
          "transpiler": {
            "id": "babel",
            "displayName": "Babel",
            "fileExtension": ".js",
            "options": {
              "plugins": [
                [
                  "@babel/plugin-transform-modules-amd",
                  {
                    "loose": true
                  }
                ]
              ]
            },
          },
          // @endif
          // @if feat.typescript
          "transpiler": {
            "id": "typescript",
            "displayName": "TypeScript",
            "fileExtension": ".ts",
            "dtsSource": [
              "./custom_typings/**/*.d.ts"
            ],
            "source": "src/**/*.ts"
          },
          // @endif
          "build": {
            "loader": {
              // @if feat.requirejs
              "type": "require",
              // @endif
              // @if feat.systemjs
              "type": "system",
              // @endif
              "configTarget": "vendor-bundle.js",
              "includeBundleMetadataInConfig": "auto",
              "plugins": [
                {
                  "name": "text",
                  "extensions": [
                    ".html",
                    ".css"
                  ],
                  "stub": true
                }
              ]
            },
            "bundles": [
              {
                "name": "app-bundle.js",
                "source": [
                  "**/*.{js,json,css,html}"
                ]
              },
              {
                "name": "vendor-bundle.js",
                "prepend": [
                  // @if feat.requirejs
                  "node_modules/requirejs/requirejs.js"
                  // @endif
                  // @if feat.systemjs
                  "node_modules/systemjs/dist/system.js"
                  // @endif
                ],
                "dependencies": [
                  "aurelia-bootstrapper",
                  "aurelia-loader-default",
                  "aurelia-pal-browser",
                  {
                    "name": "aurelia-testing",
                    "env": "dev"
                  },
                  // @if feat.requirejs
                  "text"
                  // @endif
                  // @if feat.systemjs
                  {
                    "name": "text",
                    "path": "../node_modules/systemjs-plugin-text",
                    "main": "text"
                  }
                  // @endif
                ]
              }
            ]
          }
        }
      `,
      'skeleton/lorem/aurelia_project/aurelia.json': `
        {
          "build": {
            "bundles": [
              {
                "name": "vendor-bundle.js",
                "prepend": [
                  "node_modules/lorem/boot.js"
                ],
                "dependencies": [
                  "lorem"
                ]
              }
            ]
          }
        }
      `
    });

    const box = {};
    prepareProject('aurelia-app', ['cli-bundler', 'requirejs', 'babel', 'lorem'], 'skeleton')
      .pipe(gatherFiles(box))
      .once('error', done)
      .on('finish', () => {
        expect(Object.keys(box)).toEqual(['aurelia_project/aurelia.json']);
        expect(box['aurelia_project/aurelia.json'].writePolicy).toBe(null);

        expect(JSON.parse(box['aurelia_project/aurelia.json'].contents)).toEqual({
          name: 'aurelia-app',
          type: 'project:application',
          bundler: {
            id: 'cli',
            displayName: 'Aurelia-CLI'
          },
          transpiler: {
            id: 'babel',
            displayName: 'Babel',
            fileExtension: '.js',
            options: {
              plugins: [
                [
                  '@babel/plugin-transform-modules-amd',
                  {
                    loose: true
                  }
                ]
              ]
            }
          },
          build: {
            loader: {
              type: 'require',
              configTarget: 'vendor-bundle.js',
              includeBundleMetadataInConfig: 'auto',
              plugins: [
                {
                  name: 'text',
                  extensions: [
                    '.html',
                    '.css'
                  ],
                  stub: true
                }
              ]
            },
            bundles: [
              {
                name: 'app-bundle.js',
                source: [
                  '**/*.{js,json,css,html}'
                ]
              },
              {
                name: 'vendor-bundle.js',
                prepend: [
                  'node_modules/lorem/boot.js',
                  'node_modules/requirejs/requirejs.js'
                ],
                dependencies: [
                  'lorem',
                  'aurelia-bootstrapper',
                  'aurelia-loader-default',
                  'aurelia-pal-browser',
                  {
                    name: 'aurelia-testing',
                    env: 'dev'
                  },
                  'text'
                ]
              }
            ]
          }
        });
        done();
      });
  });

  it('merges README.md', done => {
    mockfs({
      'skeleton/common/README.md': 'common',
      'skeleton/feature1/README.md': 'feature1',
      'skeleton/feature2/README.md': 'feature2'
    });

    const box = {};
    prepareProject('aurelia-app', ['feature1', 'feature2'], 'skeleton')
      .pipe(gatherFiles(box))
      .once('error', done)
      .on('finish', () => {
        expect(box).toEqual({
          'README.md': {contents: 'common\nfeature1\nfeature2', writePolicy: null}
        });
        done();
      });
  });

  it('takes last overwrite, retain write policy', done => {
    mockfs({
      'skeleton/common/some-file': 'common',
      'skeleton/feature1/some-file__skip-if-exists': 'feature1',
      'skeleton/feature2/some-file': 'feature2'
    });

    const box = {};
    prepareProject('aurelia-app', ['feature1', 'feature2'], 'skeleton')
      .pipe(gatherFiles(box))
      .once('error', done)
      .on('finish', () => {
        expect(box).toEqual({
          'some-file': {contents: 'feature2', writePolicy: 'skip'}
        });
        done();
      });
  });
});
