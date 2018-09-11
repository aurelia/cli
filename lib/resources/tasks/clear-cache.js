import gulp from 'gulp';
import {build} from 'aurelia-cli';
import cache from 'gulp-cache';

function clearTraceCache() {
  return build.clearCache();
}

function clearTranspileCache() {
  return cache.clearAll();
}

export default gulp.series(
  clearTraceCache,
  clearTranspileCache
);
