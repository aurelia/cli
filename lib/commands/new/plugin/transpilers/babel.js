'use strict';
const ProjectItem = require('../../../../project-item').ProjectItem;

module.exports = function(project) {
  Object.assign(project.model.transpiler, {
    source: 'src/**/*.js',
    'outputs': {
      'amd': {
        'compileOptions': {
          'presets': [
            [
              'es2015',
              {
                'loose': true
              }
            ],
            'stage-1'
          ],
          'plugins': [
            'syntax-flow',
            'transform-decorators-legacy',
            'transform-flow-strip-types',
            'transform-es2015-modules-amd'
          ]
        }
      },
      'commonjs': {
        'compileOptions': {
          'presets': [
            [
              'es2015',
              {
                'loose': true
              }
            ],
            'stage-1'
          ],
          'plugins': [
            'syntax-flow',
            'transform-decorators-legacy',
            'transform-flow-strip-types',
            'transform-es2015-modules-commonjs'
          ]
        }
      },
      'system': {
        'compileOptions': {
          'presets': [
            [
              'es2015',
              {
                'loose': true
              }
            ],
            'stage-1'
          ],
          'plugins': [
            'syntax-flow',
            'transform-decorators-legacy',
            'transform-flow-strip-types',
            'transform-es2015-modules-systemjs'
          ]
        }
      },
      'es2015': {
        'compileOptions': {
          'presets': [
            'stage-1'
          ],
          'plugins': [
            'syntax-flow',
            'transform-decorators-legacy',
            'transform-flow-strip-types'
          ]
        }
      }
    }
  });

  Object.assign(project.package, {
    jspm: {
      registry: 'npm',
      jspmPackage: true,
      main: project.name,
      format: 'amd',
      directories: {
        dist: 'dist/amd'
      },
      dependencies: {
        'aurelia-pal': '^1.0.0',
        'aurelia-templating': '^1.0.0'
      }
    }
  });

  project.addToContent(
    ProjectItem.resource('.eslintrc.json', 'content/eslintrc.json'),
    ProjectItem.resource('.babelrc', 'content/babelrc.webpack'),
    ProjectItem.resource('.babelrc.js', 'content/babelrc.webpack.js')
  ).addToClientDependencies(
    'aurelia-pal',
    'aurelia-templating'
  ).addToDevDependencies(
    'babel-core',
    'babel-eslint',
    'babel-plugin-syntax-flow',
    'babel-plugin-transform-class-properties',
    'babel-plugin-transform-decorators-legacy',
    'babel-plugin-transform-es2015-modules-amd',
    'babel-plugin-transform-es2015-modules-commonjs',
    'babel-plugin-transform-es2015-modules-systemjs',
    'babel-plugin-transform-flow-strip-types',
    'babel-polyfill',
    'babel-preset-env',
    'babel-preset-es2015',
    'babel-preset-stage-1',
    'babel-register',
    'eslint',
    'gulp-babel',
    'gulp-eslint',
    'babel-loader',
    'babel-plugin-istanbul',
    'karma-babel-preprocessor'
  );
};
