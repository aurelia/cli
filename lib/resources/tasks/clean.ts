import * as gulp from 'gulp';
import * as del from 'del';
import * as vinylPaths from 'vinyl-paths';
const project = require('../aurelia.json');

export default function clean() {
  return gulp.src([project.paths.output], { allowEmpty: true })
    .pipe(vinylPaths(del));
}
