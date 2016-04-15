import gulp from 'gulp';
import browserSync from 'browser-sync';
import build from './build';

export default gulp.series(
  build,
  done => {
    browserSync({
      online: false,
      open: false,
      port: 9000,
      server: {
        baseDir: ['.'],
        middleware: function(req, res, next) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          next();
        }
      }
    }, done);
  }
);
