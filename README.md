# aurelia-cli

The command line tooling for Aurelia, used for creating projects, scaffolding, bundling and more.

> To keep up to date on [Aurelia](http://www.aurelia.io/), please visit and subscribe to [the official blog](http://blog.durandal.io/). If you have questions, we invite you to join us on [our Gitter Channel](https://gitter.im/aurelia/discuss).

# Install
Run the following command to install `aurelia-cli` 

```shell
npm install aurelia-cli -g
```
 
# Configuration

The cli uses `Aureliafile.js` for various configuration. An example config file looks like:

```javascript
module.exports = function(aurelia) {
  aurelia.bundle({
    js: [{
      moduleExpression: 'aurelia-skeleton-navigation/*',
      fileName: 'nav-app-build.js',
      options: {
        inject: true
      }
    }, {
      moduleExpression: 'aurelia-bootstrapper',
      fileName: 'aurelia-framework-build.js',
      options: {
        inject: true
      }
    }],
    template : {
      pattern : 'dist/*',
      outfile : 'bundle.html'
    }
  });
}
```

# Usage

With `Aureliafile.js` file placed in the root of project containing the above configuration, run the following command to bundle the `js` modules. 

```shell
aurelia bundle
```

To bundle the templates use:

```shell
aurela tb
``

