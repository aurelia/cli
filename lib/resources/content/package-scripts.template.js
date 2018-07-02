const {series, crossEnv, concurrent, rimraf} = require('nps-utils')
// @if model.integrationTestRunner.id='protractor'
const {config: {port : E2E_PORT}} = require('./test/protractor.conf')
// @endif

module.exports = {
  scripts: {
    default: 'nps webpack',
    test: {
      // @if testRunners.jest
      default: 'nps test.jest',
      // @endif
      // @if testRunners.jest
      // @if model.transpiler.id='babel'
      jest: {
        default: series(
          rimraf('test/coverage-jest'),
          crossEnv('BABEL_TARGET=node jest')
        ),
        accept: crossEnv('BABEL_TARGET=node jest -u'),
        watch: crossEnv('BABEL_TARGET=node jest --watch'),
      },
      // @endif
      // @if model.transpiler.id='typescript'
      jest: {
        default: series(
          rimraf('test/coverage-jest'),
          'jest'
        ),
        accept: 'jest -u',
        watch: 'jest --watch',
      },
      // @endif
      // @endif

      // @if testRunners.karma
      // @if !testRunners.jest
      default: 'nps test.karma',
      // @endif
      karma: {
        default: series(
          rimraf('test/coverage-karma'),
          'karma start test/karma.conf.js'
        ),
        watch: 'karma start test/karma.conf.js --auto-watch --no-single-run',
        debug: 'karma start test/karma.conf.js --auto-watch --no-single-run --debug'
      },
      // @endif

      lint: {
        default: 'eslint src',
        fix: 'eslint src --fix'
      },
      all: concurrent({
        // @if testRunners.karma
        // @if testRunners.protractor
        browser: series.nps('test.karma', 'e2e'),
        // @endif
        // @if !testRunners.protractor
        browser: series.nps('test.karma'),
        // @endif
        // @endif
        // @if !testRunners.karma
        // @if testRunners.protractor
        browser: series.nps('e2e'),
        // @endif
        // @endif
        // @if testRunners.jest
        jest: 'nps test.jest',
        // @endif
        lint: 'nps test.lint'
      })
    },
    // @if model.integrationTestRunner.id='protractor'
    e2e: {
      default: concurrent({
        webpack: `webpack-dev-server --inline --port=${E2E_PORT}`,
        protractor: 'nps e2e.whenReady',
      }) + ' --kill-others --success first',
      protractor: {
        install: 'webdriver-manager update',
        default: series(
          'nps e2e.protractor.install',
          'protractor test/protractor.conf.js'
        ),
        debug: series(
          'nps e2e.protractor.install',
          'protractor test/protractor.conf.js --elementExplorer'
        ),
      },
      whenReady: series(
        `wait-on --timeout 120000 http-get://localhost:${E2E_PORT}/index.html`,
        'nps e2e.protractor'
      ),
    },
    // @endif
    build: 'nps webpack.build',
    webpack: {
      default: 'nps webpack.server',
      build: {
        before: rimraf('dist'),
        default: 'nps webpack.build.production',
        development: {
          default: series(
            'nps webpack.build.before',
            'webpack --progress -d'
          ),
          extractCss: series(
            'nps webpack.build.before',
            'webpack --progress -d --env.extractCss'
          ),
          serve: series.nps(
            'webpack.build.development',
            'serve'
          ),
        },
        production: {
          inlineCss: series(
            'nps webpack.build.before',
            crossEnv('NODE_ENV=production webpack --progress -p --env.production')
          ),
          default: series(
            'nps webpack.build.before',
            crossEnv('NODE_ENV=production webpack --progress -p --env.production --env.extractCss')
          ),
          serve: series.nps(
            'webpack.build.production',
            'serve'
          ),
        }
      },
      server: {
        default: `webpack-dev-server -d --devtool '#source-map' --inline --env.server`,
        extractCss: `webpack-dev-server -d --devtool '#source-map' --inline --env.server --env.extractCss`,
        hmr: `webpack-dev-server -d --devtool '#source-map' --inline --hot --env.server`
      },
    },
    serve: 'http-server dist --cors',
  },
}