---
name: CLI's built-in Bundler Cookbook
description: Recipes for common usage of CLI's built-in bundler
author: Chunpeng Huo (https://github.com/huochunpeng)
---

## Introduction

This page collects recipes for common usage of CLI's built-in bundler.
Note all following recipes are not for using `prepend`.

* [Prepend](/docs/cli/cli-bundler/dependency-management#prepend) is easier for some legacy JavaScript libraries.
* Using CDN (Content Delivery Network) is easier for css libraries, specially for those with fonts and images.

## jQuery

`npm install jquery` or `yarn add jquery`

<code-listing heading="any-file${context.language.fileExtension}">
  <source-code lang="JavaScript">
    import $ from 'jquery';
  </source-code>
  <source-code lang="TypeScript">
    import * as $ from 'jquery';
  </source-code>
</code-listing>

## normalize.css

`npm install normalize.css` or `yarn add normalize.css`

<code-listing heading="app.html">
  <source-code lang="HTML">
    <template>
      <require from="normalize.css"></require>
    </template>
  </source-code>
</code-listing>

`normalize.css`'s package name is interesting, it has file extension `.css` which matches its main file `node_modules/normalize.css/normalize.css`. We can directly do `<require from="normalize.css"></require>` because `.css` tells Aurelia the correct file type, so Aurelia understands this is a css resource.

Full path `<require from="normalize.css/normalize.css"></require>` also works here.

For some npm package like `some-css` with main file `node_modules/some-css/some.css`, we cannot use `<require from="some-css"></require>` because Aurelia will mistake `some-css` as a JavaScript resource. We can only use `<require from="some-css/some.css"></require>`.

## Bootstrap CSS v4

`npm install jquery bootstrap popper.js`

<code-listing heading="main${context.language.fileExtension}">
  <source-code lang="JavaScript">
    import 'bootstrap'; // load bootstrap JavaScript
  </source-code>
  <source-code lang="TypeScript">
    import 'bootstrap'; // load bootstrap JavaScript
  </source-code>
</code-listing>

<code-listing heading="app.html">
  <source-code lang="HTML">
    <template>
      <require from="bootstrap/css/bootstrap.min.css"></require>
    </template>
  </source-code>
</code-listing>

Note both `<require from="bootstrap/css/bootstrap.min.css"></require>` and `<require from="bootstrap/dist/css/bootstrap.min.css"></require>` work.

## Customize Bootstrap CSS v4

To customize Bootstrap, instead of using its CSS file, we need to use Bootstrap SCSS source files.

Start new app with `au new demo`, select following:
* 3. Custom
* 2. CLI's built-in bundler with RequireJS (or 3. SystemJS)
* 1. Babel (or 2. TypeScript)
* 1. Default (or 2, or 3)
* 3. Sass
* You choices on test, editor, then install dependencies with npm/yarn

`npm install jquery bootstrap popper.js` or `yarn add jquery bootstrap popper.js`

<code-listing heading="main${context.language.fileExtension}">
  <source-code lang="JavaScript">
    import 'bootstrap'; // load bootstrap JavaScript
  </source-code>
  <source-code lang="TypeScript">
    import 'bootstrap'; // load bootstrap JavaScript
  </source-code>
</code-listing>

<code-listing heading="app.scss">
  <source-code lang="SCSS">
    // customize bootstrap to use 24 columns
    // check node_modules/bootstrap/scss/_variables.scss
    // for all possible customization
    $grid-columns: 24;
    // compile node_modules/bootstrap/scss/bootstrap.scss
    @import '../node_modules/bootstrap/scss/bootstrap';
  </source-code>
</code-listing>

<code-listing heading="app.html">
  <source-code lang="HTML">
    <template>
      <require from="./app.css"></require>
    </template>
  </source-code>
</code-listing>

With CLI Bundler, all scss files are compiled by `aurelia_project/tasks/process-css.js` before sending to bundler. CLI Bundler only sees the resulting `app.css` file not the source `app.scss` file. That's why we use `./app.css` in `app.html`.

> Info: Difference with Webpack
> Webpack behaves differently, it controls the whole scss compilation. With Webpack, you need `<require from="./app.scss"></require>` in `app.html`.

## Bootstrap CSS v3 (legacy)

We need to use shim.

`npm install jquery bootstrap@3.3.7` or `yarn add jquery bootstrap@3.3.7`

<code-listing heading="aurelia_project/aurelia.json">
  <source-code lang="JavaScript">
    "bundles": [
      // ...
      {
        "name": "vendor-bundle.js",
        "prepend": [ /* ... */ ],
        "dependencies": [
          // ...
          {
            "name": "bootstrap",
            "deps": ["jquery"],
            "path": "../node_modules/bootstrap",
            "main": "dist/js/bootstrap.min"
          }
        ]
      }
    ],
    "copyFiles": {
      "node_modules/bootstrap/dist/fonts/*": "bootstrap/fonts"
    }
  </source-code>
</code-listing>

<code-listing heading="main${context.language.fileExtension}">
  <source-code lang="JavaScript">
    import 'bootstrap';
  </source-code>
  <source-code lang="TypeScript">
    import 'bootstrap';
  </source-code>
</code-listing>

<code-listing heading="app.html">
  <source-code lang="HTML">
    <template>
      <require from="bootstrap/css/bootstrap.min.css"></require>
    </template>
  </source-code>
</code-listing>

Note both `<require from="bootstrap/css/bootstrap.min.css"></require>` and `<require from="bootstrap/dist/css/bootstrap.min.css"></require>` work. But if you use `bootstrap/dist/css/bootstrap.min.css`, you need to adjust `copyFiles` target folder to `bootstrap/dist/fonts`.

<code-listing heading="use in any-file${context.language.fileExtension}">
  <source-code lang="JavaScript">
    import $ from 'jquery';
    $('[data-toggle="popover"]').popover();
  </source-code>
  <source-code lang="TypeScript">
    import * as $ from 'jquery';
    $('[data-toggle="popover"]').popover();
  </source-code>
</code-listing>

## Font Awesome v5 Free

`npm install @fortawesome/fontawesome-free` or `yarn add @fortawesome/fontawesome-free`

<code-listing heading="aurelia_project/aurelia.json">
  <source-code lang="JavaScript">
    "bundles": [
      // ...
    ],
    "copyFiles": {
      "node_modules/@fortawesome/fontawesome-free/webfonts/*": "@fortawesome/fontawesome-free/webfonts"
    }
  </source-code>
</code-listing>

<code-listing heading="app.html">
  <source-code lang="HTML">
    <template>
      <require from="@fortawesome/fontawesome-free/css/all.min.css"></require>
      optional v4-shims
      <require from="@fortawesome/fontawesome-free/css/v4-shims.min.css"></require>
      <i class="fas fa-cube"></i>
    </template>
  </source-code>
</code-listing>

## Font Awesome v4

`npm install font-awesome` or `yarn add font-awesome`

<code-listing heading="aurelia_project/aurelia.json">
  <source-code lang="JavaScript">
    "bundles": [
      // ...
    ],
    "copyFiles": {
      "node_modules/font-awesome/fonts/*": "font-awesome/fonts"
    }
  </source-code>
</code-listing>

<code-listing heading="app.html">
  <source-code lang="HTML">
    <template>
      <require from="font-awesome/css/font-awesome.min.css"></require>
      <i class="fa fa-cube"></i>
    </template>
  </source-code>
</code-listing>

## Foundation CSS v6

`npm install jquery what-input foundation-sites` or `yarn add jquery what-input foundation-sites`

<code-listing heading="main${context.language.fileExtension}">
  <source-code lang="JavaScript">
    import 'what-input';
    import 'foundation-sites'; // load foundation JavaScript
  </source-code>
  <source-code lang="TypeScript">
    import 'what-input';
    import 'foundation-sites'; // load foundation JavaScript
  </source-code>
</code-listing>

<code-listing heading="app${context.language.fileExtension}">
  <source-code lang="JavaScript">
    import $ from 'jquery';
    import Foundation from 'foundation-sites';
    export class App {
      attached() {
        // using ref="demo" in html template
        this.tooltip = new Foundation.Tooltip($(this.demo));
        // for better reuse, wrap foundation js features
        // behind Aurelia custom elements or attributes.
      }
      detached() {
        if (this.tooltip) {
          this.tooltip.destroy();
          this.tooltip = null;
        }
      }
    }
  </source-code>
  <source-code lang="TypeScript">
    import * as $ from 'jquery';
    import * as Foundation from 'foundation-sites';
    export class App {
      attached() {
        // using ref="demo" in html template
        this.tooltip = new Foundation.Tooltip($(this.demo));
        // for better reuse, wrap foundation js features
        // behind Aurelia custom elements or attributes.
      }
      detached() {
        if (this.tooltip) {
          this.tooltip.destroy();
          this.tooltip = null;
        }
      }
    }
  </source-code>
</code-listing>

<code-listing heading="app.html">
  <source-code lang="HTML">
    <template>
      <require from="foundation-sites/css/foundation.min.css"></require>
      <span ref="demo" data-tooltip class="top" tabindex="2" title="Fancy word for a beetle.">demo</span>
    </template>
  </source-code>
</code-listing>

## Materialize CSS v1

`npm install jquery materialize-css` or `yarn add jquery materialize-css`

<code-listing heading="app${context.language.fileExtension}">
  <source-code lang="JavaScript">
    import materialize from 'materialize-css';
    export class App {
      attached() {
        // using ref="modal" in html template
        materialize.Modal.init(this.modal);
        // for better reuse, wrap materialize js features
        // behind Aurelia custom elements or attributes.
      }
      detached() {
        const ins = materialize.Modal.getInstance(this.modal);
        if (ins) ins.destroy();
      }
    }
  </source-code>
  <source-code lang="TypeScript">
    import * as materialize from 'materialize-css';
    export class App {
      attached() {
        // using ref="modal" in html template
        materialize.Modal.init(this.modal);
        // for better reuse, wrap materialize js features
        // behind Aurelia custom elements or attributes.
      }
      detached() {
        const ins = materialize.Modal.getInstance(this.modal);
        if (ins) ins.destroy();
      }
    }
  </source-code>
</code-listing>

<code-listing heading="app.html">
  <source-code lang="HTML">
    <template>
      <require from="materialize-css/css/materialize.min.css"></require>
      <a class="waves-effect waves-light btn modal-trigger" href="#modal1">Modal</a>
      <div ref="modal" id="modal1" class="modal">
        <div class="modal-content">
          <h4>Modal Header</h4>
          <p>A bunch of text</p>
        </div>
        <div class="modal-footer">
          <a href="#!" class="modal-close waves-effect waves-green btn-flat">Agree</a>
        </div>
      </div>
    </template>
  </source-code>
</code-listing>
