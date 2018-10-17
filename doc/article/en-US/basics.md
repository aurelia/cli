---
name: Basics
description: The basics of the Aurelia CLI.
author: Jeroen Vinke (https://jeroenvinke.nl)
---

## Introduction

The Aurelia CLI is the official command line tool for Aurelia. It can be used to create new projects, scaffold components and to bundle your application for release. It is the best way to get started on a new Aurelia project.

## Machine Setup

The CLI itself has a couple of prerequisites that you must install first:

* Install Node.js version 8.9.0 or above.
    * You can [download it here](https://nodejs.org/en/).
* Install a Git Client
    * Here's [a nice GUI client](https://desktop.github.com).
    * Here's [a standard client](https://git-scm.com).

Once you have the prerequisites installed, you can install the Aurelia CLI itself. From the command line, use npm to install the CLI globally:

```
npm install aurelia-cli -g
```

> Info
> Always run commands from a Bash prompt. Depending on your environment, you may need to use `sudo` when executing npm global installs.


## Creating A New Aurelia Project

To create a new project, you can run `au new`. You will be presented with a number of options. If you aren't sure what you want, you can select one of the defaults. Otherwise, you can create a custom project. Simply follow the prompts.

Once you've made your choice, the CLI will show you your selections and ask if you'd like to create the file structure. After that, you'll be asked if you would like to install your new project's dependencies.

Once the dependencies are installed, your project is ready to go.


## Running Your Aurelia App

From inside your project folder, simply execute `au run`. This will build your app, creating all bundles in the process. It will start a minimal web server and serve your application. The dev web server by default auto-refreshes your browser when source code changes. If you have chosen to use ASP.NET Core and Webpack, you will want to use the `dotnet run` command instead of `au run`.

## Environments

The CLI build system understands that you might run your code in different environments. By default, you are set up with three: `dev`, `stage` and `prod`. You can use the `--env` flag to specify what environment you want to run under. For example: `au run --env prod`.

When you do a build the `src/environment.js` or `src/environment.ts` file will be overwritten by either the `dev.js`, `stage.js` or `prod.js` file from the `aurelia_project/environments` directory.

## Building Your App

Aurelia CLI apps always run in bundled mode, even during development. To build your app, simply run `au build`. You can also specify an environment to build for. For example: `au build --env stage`.

## Generators

Executing `au generate <resource>` runs a generator to scaffold out typical Aurelia constructs. Options for *resource* are: `element`, `attribute`, `value-converter`, `binding-behavior`, `task` and `generator`.

For example `au generate element my-awesome-element` generates `src/resources/my-awesome-element.js` or `my-awesome-element.ts`.

> Info: name-in-kebab-case
> By Aurelia convention, we use [kebab case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles) on name of any new `element`, `attribute`, `value-converter`, or `binding-behavior`.

There's also a `generator` generator so you can create your own, `au generate generator`.

## Aurelia.json
In the `aurelia_project` directory there is a file called `aurelia.json`. This file is the centralized settings for all the gulp tasks like build and test. We will show you more details of this file when talking about various customization.

## Webpack vs Built-in Bundler

When creating a new project using the Aurelia CLI, you are presented with a wizard to select a bundler, a module loader, CSS preprocessor and more.

On top of all choices, you first need to choose a bundler: either Webpack (the default bundler) or CLI's built-in bundler (the alternative bundler).

### Webpack

Webpack is the default choice for both ESNext and TypeScript applications.

Webpack is a bundler with built-in module loader. If you choose to use Webpack then you don't need a separate module loader. Webpack is powerful and popular, but it could be a daunting task to set up Webpack from scratch. Aurelia CLI generates a battle-tested Webpack configuration file for your app, provides a solid base for further customization if you ever need to.

> Warning
> To ensure your code work nicely with Webpack, you need to use `PLATFORM.moduleName('someModule')` calls for module references. Read more in [Webpack section](/docs/cli/webpack).

### CLI's Built-in Bundler

Aurelia CLI ships with an in-house made bundler providing similar functionality of Webpack but with much simpler configuration. If you have no experience on Webpack, we recommend using the built-in bundler.

The built-in bundler is paired with module loader RequireJS or SystemJS.

* RequireJS has been around for a very long time, it's the reference module loader for AMD module format. Comparing to SystemJS, it is considered a bit more mature and stable, but with fewer features.
* SystemJS is a "Dynamic ES module loader", the most versatile module loader in JavaScript world, supporting AMD/CommonJS/UMD or Native ESNext module format. This gives you most freedom at runtime.

Choose RequireJS if you don't need or not sure about SystemJS's capability.

> Info
> The built-in bundler supports any npm packages in CommonJS (Node.js default), AMD, UMD or Native ES Module format.

Previous versions of the built-in bundler required the user to manually maintain dependencies configuration in `aurelia.json`. But now we have a totally new bundler written from scratch, we call it auto-tracing. As the name implies, it tracks dependencies automatically without explicit configuration. You rarely need to touch `aurelia.json` for dependency management.

If you migrate an app from old CLI bundler to latest CLI bundler, most apps should still work without modifying `aurelia.json`. If your app failed to work with latest CLI bundler, please read [migration guide](/docs/cli/migrating). If you still have trouble, ask a question on [Aurelia Discourse forum](https://discourse.aurelia.io/) or create an issue on [our GitHub repo](https://github.com/aurelia/cli/issues), we will help you out.

Read [CLI bundler chapter](/docs/cli/cli-bundler) for more details.

Please refer to the following websites for more information on Webpack, RequireJS and SystemJS.
- https://webpack.github.io/
- https://requirejs.org/
- https://github.com/systemjs/systemjs/

## What if I need help?

Run `au help`, or you can reach us on [Aurelia Discourse forum](https://discourse.aurelia.io/). If you aren't sure what version of the CLI you are running, you can run `au -v`;
