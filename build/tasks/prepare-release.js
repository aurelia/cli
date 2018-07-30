var gulp = require('gulp');
var paths = require('../paths');
var conventionalChangelog = require('gulp-conventional-changelog');
var fs = require('fs');
var bump = require('gulp-bump');
var args = require('../args');

gulp.task('bump-version', function(){
  return gulp.src(['./package.json'])
    .pipe(bump({type:args.bump })) //major|minor|patch|prerelease
    .pipe(gulp.dest('./'));
});

gulp.task('changelog', function () {
  return gulp.src(paths.doc + '/CHANGELOG.md').pipe(conventionalChangelog({
    preset: 'angular'
  }))
  .pipe(gulp.dest(paths.doc));
});

gulp.task('prepare-release', gulp.series(
  'lint',
  'bump-version',
  'changelog',
  'update-cli-dependenciesjs'
));
