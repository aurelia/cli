const gulp = require('gulp');
const conventionalChangelog = require('gulp-conventional-changelog');
const bump = require('gulp-bump');
const args = require('../args');

gulp.task('bump-version', function() {
  return gulp.src('package.json')
    .pipe(bump({type: args.bump })) //major|minor|patch|prerelease
    .pipe(gulp.dest('./'));
});

gulp.task('changelog', function() {
  return gulp.src('doc/CHANGELOG.md')
    .pipe(conventionalChangelog({preset: 'angular'}))
    .pipe(gulp.dest('doc'));
});

gulp.task('prepare-release', gulp.series(
  'lint',
  'bump-version',
  'changelog',
  'update-cli-dependenciesjs'
));
