# Aurelia CLI

[![npm Version](https://img.shields.io/npm/v/aurelia-cli.svg)](https://www.npmjs.com/package/aurelia-cli)
[![ZenHub](https://raw.githubusercontent.com/ZenHubIO/support/master/zenhub-badge.png)](https://zenhub.io)
[![Join the chat at https://gitter.im/aurelia/discuss](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/aurelia/discuss?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This library is part of the [Aurelia](http://www.aurelia.io/) platform and contains its CLI implementation.

> To keep up to date on [Aurelia](http://www.aurelia.io/), please visit and subscribe to [the official blog](http://blog.aurelia.io/) and [our email list](http://eepurl.com/ces50j). We also invite you to [follow us on twitter](https://twitter.com/aureliaeffect). If you have questions, please [join our community on Gitter](https://gitter.im/aurelia/discuss) or use [stack overflow](http://stackoverflow.com/search?q=aurelia). Documentation can be found [in our developer hub](http://aurelia.io/hub.html). If you would like to have deeper insight into our development process, please install the [ZenHub](https://zenhub.io) Chrome or Firefox Extension and visit any of our repository's boards.

> **Note:** The CLI is currently in Alpha and as such may not be suitable for use on all projects yet. In particular, projects that need to make use of extensive 3rd party libraries or Aurelia plugins may not yet work or may require extensive custom configuration or workarounds. We are in the process of addressing these issues.

## Documentation

You can read documentation on the cli [here](http://aurelia.io/hub.html#/doc/article/aurelia/framework/latest/the-aurelia-cli). If you would like to help improve this documentation, the source for the above can be found in the doc folder within the framework repository.

## Building
1. Clone the aurelia-cli: `git clone https://github.com/aurelia/cli.git`
2. Go into the cli directory: `cd cli`
3. Run `npm install`
4. Link the cli with: `npm link`
5. Still in the cli directory, run `npm install git+https://git@github.com/gulpjs/gulp.git#4.0`
6. Also in the cli directory, run `npm install babel-polyfill babel-register typescript`
7. Create a new project with `au new` or use an existing project. The linked CLI will be used to create the project.
8. In the project directory, run `npm link aurelia-cli`. The linked CLI will then be used for `au` commands such as `au run`

## Running the tests
Run `npm test` to run the unit tests
