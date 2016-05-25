let del = require('del');
let project = require('../aurelia.json');

export default function clean() {
  return del([project.paths.output]);
}
