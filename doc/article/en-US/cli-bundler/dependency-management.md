---
name: CLI's built-in Bundler Dependency Management
description: Dependency Management of the CLI built-in Bundler.
author: Chunpeng Huo (https://github.com/huochunpeng)
---

## Introduction

This page covers the details of dependency management in latest built-in bundler. The new implementation, auto tracing, brings the user experience of built-in bundler to the level of Webpack, while maintaining unique flexibility thanks for the runtime capability of RequireJS and SystemJS.

## Auto Tracing

CLI's built-in bundler behaves very similar to Webpack plus aurelia-webpack-plugin.
1. auto traces JavaScript dependencies, supports CommonJS, AMD, UMD, and Native ES Module format.
2. auto stubs core Node.js modules for running in browser, use exact same stubs that Webpack and Browserify use.
3. auto traces js/html/css dependencies in Aurelia view templates `<require from="..."></require>`.

It also provides features above Webpack.
1. wrapping `"moduleName"` with `PLATFORM.moduleName("moduleName")` is not required. The built-in bundler understands all Aurelia's convention without the help of `PLATFORM.moduleName`.
2. in esnext app, `au run --auto-install` to help you install npm packages. You can keep writing code, CLI will install missing npm packages, bundle them, and refresh you browser, see auto-install at end of this page for more details.

> Warning: Limitation of Stubbing Core Node.js Modules
> Same as Webpack and Browserify, not all core Node.js functionality can be replicated in browser environment. This trick does not magically bring all npm packages to browser.

### Known problem of auto stubbing core Node.js modules

Sometimes you may see missing `process` or `Buffer` variable, as they are Node.js globals.

To fix the missing global, add these to your main${context.language.fileExtension}.

<code-listing heading="main${context.language.fileExtension}">
  <source-code lang="JavaScript">
    import process from 'process';
    window.process = process;
    import {Buffer} from 'buffer';
    window.Buffer = Buffer;
  </source-code>
  <source-code lang="TypeScript">
    import * as process from 'process';
    window.process = process;
    import {Buffer} from 'buffer';
    window.Buffer = Buffer;
  </source-code>
</code-listing>

Make sure you don't load those npm packages rely on those globals in main${context.language.fileExtension}. You need to delay them after the globals were ready, typically you can load them in app${context.language.fileExtension} or any other component delayed by Aurelia module loading.

In this scenario, you'd better not use `aurelia.setRoot(App)`, use `aurelia.setRoot(PLATFORM.moduleName('app'))` or `aurelia.setRoot('app')` or `aurelia.setRoot()` to make sure `app` module is delayed.

## Manual Tracing

There are two scenarios that auto tracing could not cover.

### 1. modules not explicitly required by your code

For modules not explicitly required (directly or indirectly), we need to tell the bundler to bundle them in.

Let's look at the default `aurelia_project/aurelia.json` of a new app.

```
"bundles": [
  {
    "name": "app-bundle.js",
    "source": [
      "**/*.{js,css,html}"
    ]
  },
  {
    "name": "vendor-bundle.js",
    "prepend": [ /* ... */ ],
    "dependencies": [
      "aurelia-bootstrapper",
      "aurelia-loader-default",
      "aurelia-pal-browser",
      {
        "name": "aurelia-testing",
        // conditional bundling for only dev environment
        "env": "dev"
      },
      // text module is slightly different for app with SystemJS
      "text"
    ]
  }
],
"loader": {
  "type": "require",
  "configTarget": "vendor-bundle.js",
  /* ... */
}
```

Note we hard coded five npm packages in `dependencies` of `vendor-bundle`. They are not directly required by your code, so we need to explicitly ask CLI bundler to bundle them.

It will be very rare for you to have additional dependencies like them.

### Conditional Dependency

`aurelia-testing` is special, it's required by your source code but behind a condition check.

```
if (environment.testing) {
  aurelia.use.plugin('aurelia-testing');
}
```

Because tracing is based on static code analysis, CLI bundler cannot smartly make conditional decision. To avoid bundling unnecessary package for production build, CLI bundler removes those conditional plugin(s) from auto traced dependencies. This kind of conditional plugin need to be configured manually.

In the above config of `aurelia-testing`, we use `"env": "dev"` to target only dev environment , if you want to target both dev and stage, use `"env": "dev & stage"`.

### 2. legacy modules that doesn't support any module format

There are not many npm packages in this category. If you do encounter one of those stubborn packages, there are two choices: prepend or shim.

## Prepend

This is the best solution to save your time on stubborn npm packages.

Those stubborn npm packages were not designed to work with any module loader. So why wast your time to try wrapping them into AMD modules? Why not just let them do what they were designed to do (polluting the global name space)?

In `aurelia_project/aurelia.json` vendor-bundle, there is a `prepend` section.

```
{
  "name": "vendor-bundle.js",
  "prepend": [
    "node_modules/bluebird/js/browser/bluebird.core.js",
    {
      "path": "node_modules/aurelia-cli/lib/resources/scripts/configure-bluebird-no-long-stacktraces.js",
      "env": "stage & prod"
    },
    {
      "path": "node_modules/aurelia-cli/lib/resources/scripts/configure-bluebird.js",
      "env": "dev"
    },
    "node_modules/requirejs/require.js"
  ],
  "dependencies": [
    // ...
  ]
}
```

vendor-bundle is the entry bundle file which you load up in `index.html`, the entry bundle is specified by `loader.configTarget` in `aurelia.json`.

```
"loader": {
  "type": "require",
  "configTarget": "vendor-bundle.js",
  // ...
}
```

CLI bundler writes those prepend files at the beginning of `vendor-bundle.js`, most importantly writes the `require.js` at end of the `prepend` list.

`require.js` brings AMD module loader up in browser.
* everything before it are executed in browser without AMD module loader.
* all bundled `"dependencies"` (and `"source"` if there is) are after `require.js`, they are all executed in an AMD environment prepared by `require.js`.

Because of the preparation of AMD environment, `prepend` only makes sense in vendor-bundle.

### tempusdominus-bootstrap-4

We will take a troublesome legacy JavaScript library `tempusdominus-bootstrap-4` to demonstrate both `prepend` and `shim`.

`tempusdominus-bootstrap-4` is a jQuery plugin of date picker. It doesn't support either AMD or CommonJS module loader. It depends on jQuery, moment, font-awesome v4 and Bootstrap v4. First we install all npm packages. Bootstrap v4 also needs additional popper.js.

`npm install tempusdominus-bootstrap-4 jquery bootstrap moment font-awesome popper.js` or `yarn add tempusdominus-bootstrap-4 jquery bootstrap moment font-awesome popper.js`

Prepend them before `require.js` so all of them can create JavaScript global objects. Note you need to list them in right order of dependency.

```
"bundles": [
  // ...
  {
    "name": "vendor-bundle.js",
    "prepend": [
      /* ... omit bluebird stuff */
      "node_modules/jquery/dist/jquery.min.js",
      "node_modules/moment/min/moment-with-locales.min.js",
      // need to use umd build of popper.js
      "node_modules/popper.js/dist/umd/popper.min.js",
      "node_modules/bootstrap/dist/js/bootstrap.min.js",
      "node_modules/tempusdominus-bootstrap-4/build/js/tempusdominus-bootstrap-4.min.js",
      "node_modules/requirejs/require.js"
    ],
    "dependencies": [ /* ... */ ]
  }
],
"copyFiles": {
  // need font-awesome v4 fonts files
  "node_modules/font-awesome/fonts/*": "font-awesome/fonts"
},
```

Now `$`, `jQuery` and `moment` are global JavaScript objects to your app. You can use them freely without any import (`import $ from 'jquery'`).

To calm eslint down on warning of `'$' is not defined`, add following line to top of any file that uses those globals.
```
/* global $, jQuery, moment */
```

> Warning
> With jquery in prepend, please don't `import $ from 'jquery'` in any code. Otherwise, auto tracing will bring in jquery npm package again, causes duplicated jquery loading (one prepend before `require.js`, one npm package after `require.js`).

> Info
> There is still a way to allow you to write `import $ from 'jquery'` when using prepend, read [onRequiringModule in CLI Bundler advanced](/docs/cli/cli-bundler/advanced) for more details.

An example of using `tempusdominus-bootstrap-4`:

<code-listing heading="app${context.language.fileExtension}">
  <source-code lang="JavaScript">
    /* global $, moment */
    export class App {
      value = moment();

      attached() {
        // for better reuse, wrap datetimepicker
        // behind an Aurelia custom element.
        $('#datetimepicker1').datetimepicker({
          date: this.value
        });

        $('#datetimepicker1').on('change.datetimepicker', e => {
          // sync back to value
          this.value = e.date;
        });
      }

      detached() {
        $('#datetimepicker1').datetimepicker('destroy');
      }
    }
  </source-code>
  <source-code lang="TypeScript">
    /* global $, moment */
    export class App {
      value = moment();

      attached() {
        // for better reuse, wrap datetimepicker
        // behind an Aurelia custom element.
        $('#datetimepicker1').datetimepicker({
          date: this.value
        });

        $('#datetimepicker1').on('change.datetimepicker', e => {
          // sync back to value
          this.value = e.date;
        });
      }

      detached() {
        $('#datetimepicker1').datetimepicker('destroy');
      }
    }
  </source-code>
</code-listing>

<code-listing heading="app.html">
  <source-code lang="HTML">
    <template>
      <require from="font-awesome/css/font-awesome.min.css"></require>
      <require from="bootstrap/css/bootstrap.min.css"></require>
      <require from="tempusdominus-bootstrap-4/build/css/tempusdominus-bootstrap-4.min.css"></require>
      <div class="container">
        <div class="row">
          <div class="col-sm-6">
            <p>Value: ${value}</p>
            <div class="form-group">
              <div class="input-group date" id="datetimepicker1" data-target-input="nearest">
                <input type="text" class="form-control datetimepicker-input" data-target="#datetimepicker1">
                <div class="input-group-append" data-target="#datetimepicker1" data-toggle="datetimepicker">
                  <div class="input-group-text"><i class="fa fa-calendar"></i></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </source-code>
</code-listing>

### Conditional Prepend

You can conditionally prepend a JavaScript file per environment, like this one conditionally adds a bluebird config for stage and prod environment.

```
{
  "path": "node_modules/aurelia-cli/lib/resources/scripts/configure-bluebird-no-long-stacktraces.js",
  "env": "stage & prod"
}
```

## Shim

Shim is a technique to wrap a legacy JavaScript library into an AMD module. Here is how you wrap `tempusdominus-bootstrap-4` into AMD module, add following to `aurelia_project/aurelia.json` vendor-bundle dependencies:

```
// remember to remove those jquery/moment... from your prepend
"dependencies": [
  // ...
  {
    "name": "tempusdominus-bootstrap-4",
    "deps": [
      "jquery",
      "bootstrap",
      "popper.js",
      "moment"
    ],
    "wrapShim": true
  }
]
```

> Info
> We only need explicit config for `tempusdominus-bootstrap-4`, all other jquery, bootstrap, popper.js, and moment are handled by auto tracing.

The above dependency configuration is called "shim", a config using `deps` or `exports` or both.

* `deps` - This is an array of dependencies which must be loaded and available before the legacy library can be evaluated.
* `exports` - (optional) This is the name of the global variable that should be used as the exported value of the module. You don't need to set `exports` if you only do `import "tempusdominus-bootstrap-4";` without using any exported object.
* `wrapShim` - (optional, try this if normal shim does not work) wrap the legacy code in a function. This will delay the execution of the legacy code to module loading time.

> Info: wrapShim
> CLI also supports global wrapShim setting in `aurelia.json` `loader.config.wrapShim` which forces `wrapShim` on all shim dependencies. More details in [CLI Bundler advanced chapter](/docs/cli/cli-bundler/advanced).

> Info: For Long Time CLI Bundler Users
> Unlike old version of CLI Bundler, we don't need `path` and `main`. Auto-trace takes care of that. `path` and `main` are now only for flexible use cases such as npm package alias or packages not in node_modules folder. Check [CLI Bundler Advanced chapter](/docs/cli/cli-bundler/advanced) for more details.

Unfortunately, the above config is still not enough for `tempusdominus-bootstrap-4`. `tempusdominus-bootstrap-4` expects a global `moment` object. But as of `momentjs` version 2.10.0, `momentjs` no longer exports global object in AMD module environment. We need to manually expose `moment` object to global namespace before loading up `tempusdominus-bootstrap-4`.

> Info
> For anyone without much experience of AMD shim, this is quite hard to figure out. That's why we **recommend prepend over shim for any legacy JavaScript library**.

We can expose `moment` to global namespace in `main.js`, then loads `tempusdominus-bootstrap-4` in `app.js`. Here is a full setup.

```
// aurelia_project/aurelia.json
"bundles": [
  // ...
  {
    "name": "vendor-bundle.js",
    "prepend": [ /* ... */ ],
    "dependencies": [
      // ...
      {
        "name": "tempusdominus-bootstrap-4",
        "deps": [
          "jquery",
          "bootstrap",
          "popper.js",
          "moment"
        ],
        "wrapShim": true
      }
    ]
  }
],
"copyFiles": {
  "node_modules/font-awesome/fonts/*": "font-awesome/fonts"
}
```
<code-listing heading="main${context.language.fileExtension}">
  <source-code lang="JavaScript">
    import moment from 'moment';
    window.moment = moment;
  </source-code>
  <source-code lang="TypeScript">
    import * as moment from 'moment';
    window.moment = moment;
  </source-code>
</code-listing>

<code-listing heading="app${context.language.fileExtension}">
  <source-code lang="JavaScript">
    import $ from 'jquery';
    import moment from 'moment';
    import 'tempusdominus-bootstrap-4';
    export class App {
      value = moment();

      attached() {
        // for better reuse, wrap datetimepicker
        // behind an Aurelia custom element.
        $('#datetimepicker1').datetimepicker({
          date: this.value
        });

        $('#datetimepicker1').on('change.datetimepicker', e => {
          // sync back to value
          this.value = e.date;
        });
      }

      detached() {
        $('#datetimepicker1').datetimepicker('destroy');
      }
    }
  </source-code>
  <source-code lang="TypeScript">
    import * as $ from 'jquery';
    import * as moment from 'moment';
    import 'tempusdominus-bootstrap-4';
    export class App {
      value = moment();

      attached() {
        // for better reuse, wrap datetimepicker
        // behind an Aurelia custom element.
        $('#datetimepicker1').datetimepicker({
          date: this.value
        });

        $('#datetimepicker1').on('change.datetimepicker', e => {
          // sync back to value
          this.value = e.date;
        });
      }

      detached() {
        $('#datetimepicker1').datetimepicker('destroy');
      }
    }
  </source-code>
</code-listing>

<code-listing heading="app.html">
  <source-code lang="HTML">
    <template>
      <require from="font-awesome/css/font-awesome.min.css"></require>
      <require from="bootstrap/css/bootstrap.min.css"></require>
      <require from="tempusdominus-bootstrap-4/build/css/tempusdominus-bootstrap-4.min.css"></require>
      <div class="container">
        <div class="row">
          <div class="col-sm-6">
            <p>Value: ${value}</p>
            <div class="form-group">
              <div class="input-group date" id="datetimepicker1" data-target-input="nearest">
                <input type="text" class="form-control datetimepicker-input" data-target="#datetimepicker1">
                <div class="input-group-append" data-target="#datetimepicker1" data-toggle="datetimepicker">
                  <div class="input-group-text"><i class="fa fa-calendar"></i></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </source-code>
</code-listing>

## au run --auto-install

When you run `au run` with `--auto-install`, it auto installs missing npm packages while tracing your source code. You can keep writing code, CLI bundler will take care of `npm install some-package` (or `yarn add some-package`).

> Warning: TypeScript App is Not Supported
> Due to TypeScript stops compilation when detecting missing npm package, CLI bundler could not get any information on the missing package.

This is lots of fun! You could just write `<require from="bootstrap/css/bootstrap.min.css"></require>` in `app.html`, then shortly after, boom! you will see style change in browser.

> Info: Limitation
> auto-install only installs latest version of the package, if you want a special version, do manual install.

