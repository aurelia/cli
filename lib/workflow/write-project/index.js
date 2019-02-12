const prepareProject = require('./prepare-project');
const writeProject = require('./write-project');

module.exports = function(projectName, features, projectFolder, unattended) {
  const stream = prepareProject(projectName, features)
    .pipe(writeProject(projectFolder, {unattended}));

  return new Promise((resolve, reject) => {
    stream.once('error', reject).on('finish', resolve);
  });
};
