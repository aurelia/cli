const gulp = require('gulp');
const eslint = require('gulp-eslint');
const conventionalChangelog = require('gulp-conventional-changelog');
const bump = require('gulp-bump');
const yargs = require('yargs');

function lint() {
  return gulp.src(['lib/**/*.js', 'spec/**/*.js', 'lib/**/*.ts', 'spec/**/*.ts'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
}

function bumpVersion() {
  const validBumpTypes = ['major', 'minor', 'patch', 'prerelease'];
  const bumpType = (yargs.argv.bump || 'patch').toLowerCase();

  if (validBumpTypes.indexOf(bumpType) === -1) {
    throw new Error('Unrecognized bump "' + bumpType + '".');
  }

  return gulp.src('package.json')
    .pipe(bump({type: bumpType})) //major|minor|patch|prerelease
    .pipe(gulp.dest('./'));
}

function changelog() {
  return gulp.src('doc/CHANGELOG.md')
    .pipe(conventionalChangelog({preset: 'angular'}))
    .pipe(gulp.dest('doc'));
}

exports.lint = lint;
exports['bump-version'] = bumpVersion;
exports.changelog = changelog;
exports['prepare-release'] = gulp.series(
  lint,
  bumpVersion,
  changelog
);
