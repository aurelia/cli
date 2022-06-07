# Aurelia CLI

![CI](https://github.com/aurelia/cli/workflows/CI/badge.svg)
[![npm Version](https://img.shields.io/npm/v/aurelia-cli.svg)](https://www.npmjs.com/package/aurelia-cli)
[![Join the chat at https://gitter.im/aurelia/discuss](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/aurelia/discuss?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Twitter](https://img.shields.io/twitter/follow/aureliaeffect.svg?style=social&label=Follow)](https://twitter.com/intent/follow?screen_name=aureliaeffect)

This library is part of the [Aurelia](http://www.aurelia.io/) platform and contains its CLI implementation.
To keep up to date on [Aurelia](http://www.aurelia.io/), please visit and subscribe to [the official blog](http://blog.aurelia.io/) and [our email list](http://eepurl.com/ces50j). We also invite you to [follow us on twitter](https://twitter.com/aureliaeffect). If you have questions look around our [Discourse forums](https://discourse.aurelia.io/), chat in our [community on Gitter](https://gitter.im/aurelia/discuss) or use [stack overflow](http://stackoverflow.com/search?q=aurelia). Documentation can be found [in our developer hub](http://aurelia.io/docs).

## Documentation

You can read documentation on the cli [here](https://aurelia.io/docs/cli). If you would like to help improve this documentation, visit [aurelia/documentation](https://github.com/aurelia/documentation/tree/master/current/en-us/11.%20cli).

## Contributing

Please see the [contributing guidelines](./CONTRIBUTING.md).

## Providing new feature to app skeleton

App skeleton is no longer in this repo, it has been moved to a dedicated repo [aurelia/v1](https://github.com/aurelia/v1). Any contribution to app skeleton should go into [aurelia/v1](https://github.com/aurelia/v1).

The `au new` command now simplify wraps `npx makes aurelia/v1`. Users can directly use that makes command to create new project.

## Building

1. Clone the aurelia-cli: `git clone https://github.com/aurelia/cli.git`
2. Go into the cli directory: `cd cli`
3. Run `npm install`
4. Run build `npm run build`
5. Link the cli with: `npm link`
6. Create a new project with `au new` or use an existing project. The linked CLI will be used to create the project.
7. In the project directory, run `npm link aurelia-cli`. The linked CLI will then be used for `au` commands such as `au run`

## Running the Tests

Run `npm test` to run the unit tests.

## Release new aurelia-cli version

Just run `npm version patch` (or minor or major)

## License

MIT.
