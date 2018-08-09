---
name: CLI + built-in Bundler Advanced
description: Advanced Usage of the CLI built-in Bundler.
author: Chunpeng Huo (https://github.com/huochunpeng)
---

## Introduction

This page covers advanced usage of CLI built-in bundler. Thanks for the runtime capability of RequireJS and SystemJS, apps built with CLI bundler are very flexible at runtime.

## onRequiringModule

onRequiringModule is an API to customize CLI bundler's behavior on module tracing. Use this API in in `aurelia_project/tasks/build.js` (or `build.ts`).

```
function writeBundles() {
  return buildCLI.dest({
    onRequiringModule: function(moduleId) {
      //...
    }
  });
}
```

This optional callback is called before auto-tracing any moduleId (including auto-stubbing core Node.js modules).
It would not be called for any modules provided by app's src files or explicit
dependencies config in aurelia.json.

You can return three types of result (all can be returned in promise):
1. Boolean `false`: ignore this moduleId;
2. Array of strings like `['a', 'b']`: ignore this moduleId, but require module id "a" and "b" instead;
3. A string: the full JavaScript content of this module, must be in AMD format;
4. All other returns are ignored and go onto performing auto-tracing.

Here are examples of use cases:

### 1. ignore certain moduleId at bundling time, supply it at runtime

To build a multi-tenancy app, you can ignore moduleId "client-info" at bundling time, then fills it up at runtime.

First, calm CLI bundler down on missing module.

```
function writeBundles() {
  return buildCLI.dest({
    onRequiringModule: function(moduleId) {
      // 1. Boolean `false`: ignore this moduleId;
      if (moduleId === 'client-info') return false;
    }
  });
}
```

If you use TypeScript, add a `ts-ignore` to calm TypeScript compiler down.

```TypeScript
// @ts-ignore TS2307
import * as clientInfo from 'client-info';
```

Second, add a path in `aurelia_project/aurelia.json` to point it to runtime location you will supply it.
```
"paths": {
  "root": "src",
  "resources": "resources",
  "elements": "resources/elements",
  "attributes": "resources/attributes",
  "valueConverters": "resources/value-converters",
  "bindingBehaviors": "resources/binding-behaviors",
  "client-info": "../customize/client-info"
}
```

Note `"../customize/client-info"` is relative to `"root": "src"`, it will resolve to `https://hostname/customize/client-info.js` at runtime when RequireJS loads the missing module. You need to make sure you supply an AMD or UMD format JavaScript file at that location. Technically it should be an anonymous AMD module, not named AMD module.

> Warning: No CommonJS and Native ES Module at runtime for RequireJS
> CommonJS and Native ES Module are not supported at runtime, they are only acceptable at bundling time.

> Warning: Native ES Module at runtime for SystemJS
> Native ES Module is not supported at runtime. But SystemJS supports it with extra transpiler config, we would not go into details here.

For local dev, you can have a local `customize/client-info.js` something like this:
```js
define(function() {return "client-info";});
```

Note SystemJS is different, the above path `"client-info": "../customize/client-info"` doesn't work for SystemJS at runtime. For SystemJS, you need to:
1. change the import line to `import * as clientInfo from 'client-info.js';` with `.js` extension.
2. supply the runtime module at `https://hostname/client-info.js`

### 2. bundling depedencies for missing module

This is a companion feature to support the previous use case. For instance, your runtime `client-info` module uses lodash, but your main app doesn't use lodash. We want to bundle lodash in our app.

Example of `client-info` module code.
```js
define(['lodash'], function(_) {return _.camelCase("client-info");});
```

Bring lodash in.
```
function writeBundles() {
  return buildCLI.dest({
    onRequiringModule: function(moduleId) {
       // 2. Array of strings like `['a', 'b']`: require module id "a" and "b" instead;
       if (moduleId === 'client-info') return ['lodash'];
    }
  });
}
```

Note the above is not the only way to achieve the outcome. You can also do:

```
onRequiringModule: function(moduleId) {
  // 1. Boolean `false`: ignore this moduleId;
  if (moduleId === 'client-info') return false;
}
```

Plus

<code-listing heading="aurelia_project/aurelia.json">
  <source-code lang="JavaScript">
    "bundles": [
      // ...
      {
        "name": "vendor-bundle.js",
        "prepend": [ /* ... */ ],
        "dependencies": [
          // ...
          // force bundling lodash
          "lodash"
        ]
      }
    ]
  </source-code>
</code-listing>

### 3. supply module implementation directly

In previous chapter "Dependency Management", we said

> With jquery in prepend, please don't `import $ from 'jquery'` in any code. Otherwise, auto tracing will bring jquery npm package into bundler again, causes duplicated jquery loading (one prepend before `require.js`, one npm package after `require.js`).

Here is how you can still allow `import $ from 'jquery'`.

```
onRequiringModule: function(moduleId) {
  // 3. A string: the full JavaScript content of this module, must be in AMD format;
  // just return global jQuery object
  if (moduleId === 'jquery') return `define(function() {return window.jQuery});`;
}
```

This trick is particularly useful if you want to test your source code in Node.js env (where you want to load npm package jquery), and run your app in browser with jquery prepended.

## Global wrapShim

In previous chapter "Dependency Management", we showed `wrapShim` per shim. You can also set it globally.

<code-listing heading="aurelia_project/aurelia.json">
  <source-code lang="JavaScript">
    "build": {
      "loader": {
        "type": "require",
        "configTarget": "vendor-bundle.js",
        "includeBundleMetadataInConfig": "auto",
        "config": {
          "wrapShim": true
        }
      }
    }
  </source-code>
</code-listing>

`wrapShim` wraps shimmed legacy code in a function. This will delay the execution of the legacy code to module loading time.

## Npm package alias

In dependency config, there are two more fields you can play with:

* `path` - This is a path to the folder where the package's source is located. This path is relative to your application's `src` folder.
* `main` - This is the main module (entry point) of the package, relative to the `path`. It works with or without `.js` file extension.

For instance, monaco-languageclient wants to use a patched version of vscode. You can alias vscode like this:

```
{
  "name": "vscode",
  "path": "../node_modules/monaco-languageclient/lib",
  "main": "vscode-compatibility"
}
```

## Local copy of npm package

Similar to the above example, you can do:

```
{
  "name": "my-awesome-package",
  "path": "../my-awesome-package",
  // main field is optional, as long as you have a package.json in
  // my-awesome-package folder, CLI bundler can read it and find main file
  "main": "index"
}
```

If it is a single-file package, you can merge path and main:
```
{
  "name": "my-awesome-package",
  "path": "../my-awesome-package/the-entry-file.js"
}
```

This short-cut can also be used in npm package alias.

## Lazy bundling of main file

The default behavior on npm package main file:

* lazy loading for any package without explicit config.
* eager loading for package with explicit config. This design suggests you only use explicit config on lib that is not explicitly required by your code (directly or indirectly).
* you can use `"lazyMain": true` in explicit config to force lazy loading.

For example, you have a local copy of lodash, but don't want to pack main file (the main file imports all lodash features).
```
{
  "name": "lodash",
  "path": "../lodash",
  // you can let CLI bundler to find main file in package.json
  // or explicitly name main file
  // "main": "lodash"
  "lazyMain": true
}
```

With lazyMain setup, if you only use `import map from 'lodash/map';`, only `loash/map.js` will be bundled.

lazyMain would not prevent bundling the main file when you use `import _ from 'lodash';`, it only ensures not bundling it blindly.

