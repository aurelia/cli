var cli = process.AURELIA;
var installer = cli.import('lib/installer');

// New
//
// Executable command for creating and downloading new Aurelia projects.
function New(options){
  installer.installTemplate('skeleton-navigation');
}

module.exports = New;
