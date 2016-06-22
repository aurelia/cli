# Aurelia CLI

[![npm Version](https://img.shields.io/npm/v/aurelia-cli.svg)](https://www.npmjs.com/package/aurelia-cli)
[![ZenHub](https://raw.githubusercontent.com/ZenHubIO/support/master/zenhub-badge.png)](https://zenhub.io)
[![Join the chat at https://gitter.im/aurelia/discuss](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/aurelia/discuss?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This library is part of the [Aurelia](http://www.aurelia.io/) platform and contains its CLI implementation.

> To keep up to date on [Aurelia](http://www.aurelia.io/), please visit and subscribe to [the official blog](http://blog.durandal.io/) and [our email list](http://durandal.us10.list-manage1.com/subscribe?u=dae7661a3872ee02b519f6f29&id=3de6801ccc). We also invite you to [follow us on twitter](https://twitter.com/aureliaeffect). If you have questions, please [join our community on Gitter](https://gitter.im/aurelia/discuss). If you would like to have deeper insight into our development process, please install the [ZenHub](https://zenhub.io) Chrome or Firefox Extension and visit any of our repository's boards. You can get an overview of all Aurelia work by visiting [the framework board](https://github.com/aurelia/framework#boards).

## Machine Setup

The CLI itself has a couple of prerequisites that you need to install first.

* Install NodeJS >= 4.x.
    * You can [download it here](https://nodejs.org/en/).
    * There may be some issues with Node 6. If you experience that, please help us track them down and resolve them.
* Install a Git Client
    * Here's [a nice GUI client](https://desktop.github.com).
    * Here's [a standard client](https://git-scm.com).

Once you have the prerequisites installed, you can install the Aurelia CLI itself. From the command line, use npm to install the CLI globally:

```
npm install aurelia-cli -g
```

Note: Always run commands from a Bash (preferred) or Powershell prompt. Depending on your environment, you may need to use `sudo` when executing npm global installs.

## Creating A New Aurelia Project

To create a new project, you can run `au new`. You will be presented with a number of options. If you aren't sure what you want, you can select one of the defaults. Otherwise, you can create a custom project. Simply follow the prompts.

Once you've made your choice, the CLI will show you your selections and ask if you'd like to create the file structure. After that, you'll be asked if you would like to install your new project's dependencies.

Once the dependencies are installed, your project is ready to go.

### ASP.NET Core

If you would like to use ASP.NET Core, first begin by using Visual Studio to create your ASP.NET Core project. Select whatever options make the most sense based on your .NET project plans. After you have created the project, open a command line and change directory into your web project's project folder. This is the folder that contains the `.xproj` file. From within this folder, you can execute the following command `au new --here` which will setup Aurelia "here" inside this project folder. When asked for default or custom setup, select "Custom". After this, you will be prompted to choose the platform you want. Simply select "ASP.NET Core". Follow the prompts for the rest of the process, just like above.

Note: ASP.NET Core Platform support is in an early stage of development. There are a few known issues we are working on at present.

## Running Your Aurelia App

From inside your project folder, simply execute `au run`. This will build your app, creating all bundles in the process. It will start a minimal web server and serve your application. If you would like to develop, with auto-refresh of the browser, simply specify the `--watch` flag like this: `au run --watch`.

### Environments

The CLI build system understands that you might run your code in different environments. By default, you are set up with three: `dev`, `stage` and `prod`. You can use the `--env` flag to specify what environment you want to run under. For example: `au run --env prod --watch`.

## Building Your App

Aurelia CLI apps always run in bundled mode, even during development. To build your app, simply run `au build`. You can also specify an environment to build for. For example: `au build --env stage`.

## Unit Testing

If you selected a project setup that includes unit tests, you can run your tests with `au test`. If you would like to adopt a tdd-based workflow, writing code and tests with continual test evaluation, you can use the `--watch` flag. For example: `au test --watch`.

## Generators

Executing `au generate resource` runs a generator to scaffold out typical Aurelia constructs. Resource options are: element, attribute, value-converter, binding-behavior, task and generator. That's right...there's a generator generator so you can write your own. Ex. `au generate element`

## Adding Client Libraries to Your Project

If you need to add a client library to your project, first `npm install` the library. After that, open the `aurelia_project/aurelia.json` file and scroll down to the build/bundles section. You'll need to add the library into a bundle's `dependencies` section. Take a look at the existing configuration to see some different options.

Note: One of the first new features you'll see in the coming weeks is a new command to help you with 3rd party module installation. The command will inspect a previously npm-installed package, and make a configuration recommendation to you, automating the process if you desire.

## What if I forget these commands?

If you need your memory refreshed as to what the available options are, at any time you can execute `au help`.
