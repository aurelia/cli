import * as gulp from 'gulp';
import * as browserSync from 'browser-sync';
import * as historyApiFallback from 'connect-history-api-fallback/lib';
import * as project from '../aurelia.json';
import build from './build';
import {CLIOptions} from 'aurelia-cli';

function onChange(path) {
  console.log(`File Changed: ${path}`);
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
        baseDir: ['.'],
        middleware: [historyApiFallback(), function(req, res, next) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          next();
        }]
      }
    }, function (err, bs) {
      let urls = bs.options.get('urls').toJS();
      console.log(`Application Available At: ${urls.local}`);
      console.log(`BrowserSync Available At: ${urls.ui}`);
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

