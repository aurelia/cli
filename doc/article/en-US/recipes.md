---
name: Recipes & known issues
description: In this section you can find examples of particular setups, known issues and possible workarounds
author: Jeroen Vinke (https://jeroenvinke.nl)
---

## Introduction
In this section you can find examples of particular setups, known issues and possible workarounds

## Aurelia-CLI bundler + Docker

When using the Aurelia-CLI bundler together with Docker you might notice that the file watcher doesn't pick up changes that are made from the host.

In order to resolve this you can open up the `aurelia_project/tasks/watch.js` (or `watch.ts` when using typescript) and modify the `watchPath` function to use polling:

<code-listing heading="Build options">
  <source-code lang="JavaScript">
  let watchPath = (p) => {
    gulpWatch(
      p,
      {
        read: false,
        verbose: true,
        usePolling: true
      },
      (vinyl) => processChange(vinyl));
  };
  </source-code>
</code-listing>

More information on this problem be found in [this issue](https://github.com/floatdrop/gulp-watch/issues/174).

## NPM uninstalling packages
If you're on NPM 5.6.0 (`npm -v`) then you might experience strange behavior when you're trying to install a package (using `npm install`). This should be resolved with version 5.7.0 of NPM.
