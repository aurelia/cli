module.exports = {
  ...require('./au-generate'),
  ...require('./au-jest'),
  ...require('./au-karma'),
  ...require('./au-lint'),
  ...require('./au-cypress'),
  ...require('./au-protractor'),
  ...require('./dotnet-run')
};
