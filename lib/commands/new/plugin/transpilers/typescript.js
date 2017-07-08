'use strict';
const ProjectItem = require('../../../../project-item').ProjectItem;

module.exports = function(project) {
  Object.assign(project.model.transpiler, {
    source: 'src/**/*.ts',
    dtsSource: [
      './custom_typings/**/*.d.ts'
    ],
    outputs: {
      es2015: {
        compileOptions: {
          module: 'es2015',
          target: 'es2015'
        }
      },
      commonjs: {
        compileOptions: {
          module: 'commonjs'
        }
      },
      amd: {
        compileOptions: {
          module: 'amd'
        }
      },
      system: {
        compileOptions: {
          module: 'system'
        }
      }
    }
  });

  Object.assign(project.package, {
    typings: `dist/commonjs/${project.name}.d.ts`,
    jspm: {
      registry: 'npm',
      jspmPackage: true,
      main: project.name,
      format: 'amd',
      directories: {
        dist: 'dist/amd'
      },
      dependencies: {
        'aurelia-framework': '^1.0.0'
      }
    }
  });

  project.addToContent(
    ProjectItem.resource('tslint.json', 'content/tslint.json'),
    ProjectItem.resource('tsconfig.json', 'content/tsconfig.template.json')
      .asTemplate(project.model)
  ).addToTasks(
    ProjectItem.resource('transpile.ts', 'tasks/plugin/transpile.ts')
  ).addToClientDependencies(
    'aurelia-framework'
  ).addToDevDependencies(
    '@types/del',
    '@types/event-stream',
    '@types/gulp',
    '@types/gulp-plumber',
    '@types/gulp-sourcemaps',
    '@types/vinyl-paths',
    '@types/node',
    '@types/jasmine',
    'event-stream',
    'gulp-typescript',
    'gulp-tslint',
    'tslint',
    'typescript',
    'ts-loader'
  );
};
