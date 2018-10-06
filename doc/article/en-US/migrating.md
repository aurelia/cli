---
name: Migrating
description: Migrate from CLI built-in bundler to Webpack, or from old built-in bundler to new auto-tracing bundler.
author: Jeroen Vinke (https://jeroenvinke.nl)
---

## From CLI Bundler to Webpack

There are differences between the Aurelia CLI bundler and the Webpack bundler. When you are migrating an existing application from the integrated bundler to Webpack there are a few things to keep in mind.

The recommended way to migrate is to create a new Webpack application using the CLI, choosing similar technology as the project that you want to migrate. Then you would copy over the source code (in the `src` folder by default) and the unit tests (in the `test/unit` folder). After that you will have to make some changes to the codebase, which are explained below.

Webpack requires the use of `PLATFORM.moduleName()` for any module reference in the code, except for the import statements. `PLATFORM` can be imported using `import {PLATFORM} from 'aurelia-pal';`.

A few examples:
- in `main.js` or `main.ts` do `aurelia.setRoot(PLATFORM.moduleName('app'))`.
- for routes do `{ ...., name: 'users', moduleId: PLATFORM.moduleName('./users'), ... }`
- `@useView(PLATFORM.moduleName('my-view.html'))`
- `.resources(PLATFORM.moduleName('resources/index'))`
- when Webpack cannot find a module even though it exists, you likely are missing a PLATFORM.moduleName for that module

The Aurelia CLI bundler gets its bundle configuration from the `aurelia_project/aurelia.json` file. This is different for Webpack, where the bundle configuration is inside `webpack.config.js`. Webpack projects created by the CLI use Aurelia's Webpack Plugin, which you'll find in `webpack.config.js`.

If you use SASS or LESS, then you are going to have to import the stylesheets differently. When you include stylesheets and use the Aurelia CLI bundler, then your `<require>` statements will have the `.css` extension: `<require from="styles/my-stylesheet.css"></require>`. When you use Webpack you have to change this into the `.sass` or `.less` extension: `<require from="styles/my-stylesheet.sass"></require>`.

## Upgrade to Auto-Tracing Bundler (1.0.0-beta.1 or above)

This is for existing CLI built-in bundler (RequireJS/SystemJS) users. It is irrelevant to Webpack users.

Auto-tracing bundler in 1.0.0-beta.1 replaced [amodro-trace](https://github.com/amodrojs/amodro-trace) based bundler. The implementation is totally new, but on the surface, we maintain maximum backward compatibility.

Most of existing apps should still work without any modification of `aurelia.json`. But you could be caught with some bugs and one breaking change: the way to reference non-js main file is changed. The non-js main (or missing main) is used by some pure css npm package like font-awesome v4 and normalize.css.

For example font-awesome v4, you should remove the explicit dependency configuration `{"name": "font-awesome", ...` from `aurelia.json`, have a look at [cook-book](/docs/cli/cli-bundler/cook-book) on how to use font-awesome v4 and normalize.css with latest CLI bundler. It is only easier.

Once your app works, you should start to cleanup `aurelia.json` vendor-bundle dependencies to take advantages of auto-tracing. Following are the minimum required dependencies.

```
"aurelia-bootstrapper",
"aurelia-loader-default",
"aurelia-pal-browser",
{
  "name": "aurelia-testing",
  "env": "dev"
},
// for requirejs
"text",
// or for systemjs
// {
//   "name": "text",
//   "path": "../node_modules/systemjs-plugin-text",
//   "main": "text"
// }
```

For any 3rd party dependency, if it's not a shim (has `"deps"` or `"exports"` or both), not a custom local package, not a package alias, you can remove its config. Auto-tracing bundles npm packages automatically without manual configuration in `aurelia.json`.

The new bundler also uses cache to speed up consecutive builds. To turn it on, update `aurelia.json` file. You can use `"cache": true` to turn it on for all environments.
```javascript
"options": {
  "minify": "stage & prod",
  "sourcemaps": "dev & stage",
  "rev": false,
  "cache": "dev & stage"
}
```

You would need the new task file for command `au clear-cache`. Use latest cli to create a new app choosing built-in bundler. Then copy following files from the new app to your existing app:
```
aurelia_project/tasks/clear-cache.js (or .ts)
aurelia_project/tasks/clear-cache.json
```
Only for esnext app (not TypeScript app), do `npm install --save-dev gulp-cache` or `yarn add -D gulp-cache`, copy the new `aurelia_project/tasks/transpile.js` which further improves performance using gulp-cache to cache transpiling result.

For more information, read [Built-in Bundler Chapter](/docs/cli/cli-bundler).

## Update 3rd party plugin installation guide

For all Aurelia plugin authors, you should update the installation guide to remove dedicated CLI guide. The installation of any Aurelia plugin is now same for Webpack and CLI bundler users, just do `npm install your-plugin`.
