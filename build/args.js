const yargs = require('yargs');

const argv = yargs.argv;
const validBumpTypes = ['major', 'minor', 'patch', 'prerelease'];
const bump = (argv.bump || 'patch').toLowerCase();

if (validBumpTypes.indexOf(bump) === -1) {
  throw new Error('Unrecognized bump "' + bump + '".');
}

module.exports = {
  bump: bump
};
