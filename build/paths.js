var path = require('path');
var root = path.join.bind(path, __dirname, '../');

var cliRoot = root.bind(root, 'src');

module.exports = {
  root     : root,
  cliRoot  : cliRoot,
  source   : [cliRoot('**/*.js'), '!'+cliRoot('**/templates/**/*'), '!'+cliRoot('**/template/**/*')],
  sourceTemp : [cliRoot('**/templates/**/*'), cliRoot('**/template/**/*')],
  output   : root('dist'),
  doc      : root('doc'),
  e2eSpecsSrc: 'test/e2e/src/*.js',
  e2eSpecsDist: 'test/e2e/dist/'
};
