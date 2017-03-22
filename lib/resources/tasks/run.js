import gulp from 'gulp';
import browserSync from 'browser-sync';
import historyApiFallback from 'connect-history-api-fallback/lib';
import project from '../aurelia.json';
import build from './build';
import {CLIOptions} from 'aurelia-cli';

function log(message) {
  console.log(message); //eslint-disable-line no-console
}

function onChange(path) {
  log(`File Changed: ${path}`);
}

function reload(done) {
  browserSync.reload();
  done();
}

let serve = gulp.series(
  build,
  done => {
    browserSync({
      online: false,
      open: false,
      port: 9000,
      logLevel: 'silent',
      server: {
        baseDir: [project.platform.baseDir],
        middleware: [historyApiFallback(), function(req, res, next) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          next();
        }]
      }
    }, function(err, bs) {
      if (err) return done(err);
      let urls = bs.options.get('urls').toJS();
      log(`Application Available At: ${urls.local}`);
      log(`BrowserSync Available At: ${urls.ui}`);
      done();
    });
  }
);

let refresh = gulp.series(
  build,
  reload
);

let watch = function(refreshCb, onChangeCb) {
  return function(done) {
    gulp.watch(project.transpiler.source, refreshCb).on('change', onChangeCb);
    gulp.watch(project.markupProcessor.source, refreshCb).on('change', onChangeCb);
    gulp.watch(project.cssProcessor.source, refreshCb).on('change', onChangeCb);

    //see if there are static files to be watched
    if (typeof project.build.copyFiles === 'object') {
      const files = Object.keys(project.build.copyFiles);
      gulp.watch(files, refreshCb).on('change', onChangeCb);
    }
  };
};

let run;

if (CLIOptions.hasFlag('watch')) {
  run = gulp.series(
    serve,
    watch(refresh, onChange)
  );
} else {
  run = serve;
}

export { run as default, watch };
