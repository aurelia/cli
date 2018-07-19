'use strict';

module.exports = {
  ...require('./au-run'),
  ...require('./au-build'),
  ...require('./au-test'),
  ...require('../generic/au-lint'),
  ...require('./au-protractor'),
  ...require('../generic/au-jest'),
  dotnet: {
    ...require('../generic/dotnet-run')
  }
};
