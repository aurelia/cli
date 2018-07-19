'use strict';

module.exports = {
  ...require('./au-run'),
  ...require('../generic/au-lint'),
  ...require('./au-karma'),
  ...require('../generic/au-jest'),
  ...require('./au-protractor')
};
