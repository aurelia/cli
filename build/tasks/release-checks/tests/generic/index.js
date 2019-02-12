module.exports = {
  ...require('./au-generate'),
  ...require('./au-jest'),
  ...require('./au-karma'),
  ...require('./au-lint'),
  ...require('./dotnet-run')
};
