// For simplicity, all questions are selects.
// We use value 'none' as a convention for no feature selected,
// because enquirer doesn't support empty string '' as a value.

exports.askBundler = {
  message: 'Which bundler would you like to use?',
  choices: [{
    value: 'webpack',
    message: 'Webpack',
    hint: 'A powerful and popular bundler for JavaScript.'
  }, {
    value: 'cli-bundler',
    message: "CLI's built-in bundler with an AMD module loader",
    hint: 'Provides similar capabilities but with much simpler configuration.'
  }]
};

exports.askLoader = {
  message: 'Which AMD module loader would you like to use?',
  choices: [{
    value: 'requirejs',
    message: 'RequireJS',
    hint: 'RequireJS is a mature and stable module loader for JavaScript.'
  }, {
    value: 'alameda',
    message: 'Alameda',
    hint: 'Alameda is a modern version of RequireJS using promises and native es6 features (modern browsers only).'
  }, {
    value: 'systemjs',
    message: 'SystemJS',
    hint: 'SystemJS is Dynamic ES module loader, the most versatile module loader for JavaScript.'
  }],
  // This if condition is not an enquirer feature.
  // This is our convention, check ./applicable.js for acceptable expressions
  if: 'cli-bundler'
};

exports.askHttp = {
  message: 'Which HTTP Protocol do you wish the outputted Webpack bundle to be optimised for?',
  choices: [{
    value: 'http1',
    message: 'HTTP/1.1',
    hint: 'The legacy HTTP/1.1 protocol, max 6 parallel requests/connections.'
  }, {
    value: 'http2',
    message: 'HTTP/2',
    hint: 'The modern HTTP/2 Protocol, uses request multiplexing over a single connection.'
  }],
  // This if condition is not an enquirer feature.
  // This is our convention, check ./applicable.js for acceptable expressions
  if: 'webpack'
};

exports.askPlatform = {
  message: 'What platform are you targeting?',
  choices: [{
    value: 'web',
    message: 'Web',
    hint: 'The default web platform setup.'
  }, {
    value: 'dotnet-core',
    message: '.NET Core',
    hint: 'A powerful, patterns-based way to build dynamic websites with .NET Core.'
  }]
};

exports.askTranspiler = {
  message: 'What transpiler would you like to use?',
  choices: [{
    value: 'babel',
    message: 'Babel',
    hint: 'An open source, standards-compliant ES2015 and ESNext transpiler.'
  }, {
    value: 'typescript',
    message: 'TypeScript',
    hint: 'An open source, ESNext superset that adds optional strong typing.'
  }]
};

exports.askMarkupProcessor = {
  message: 'How would you like to setup your HTML template?',
  choices: [{
    value: 'none',
    message: 'None',
    hint: 'No markup processing'
  }, {
    value: 'htmlmin-min',
    message: 'Minimum Minification',
    hint: 'Removes comments and whitespace between block level elements such as div, blockquote, p, header, footer ...etc.'
  }, {
    value: 'htmlmin-max',
    message: 'Maximum Minification',
    hint: 'Removes comments, script & link element [type] attributes and all whitespace between all elements. Also remove attribute quotes where possible. Collapses boolean attributes.'
  }]
};

exports.askCssProcessor = {
  message: 'What css processor would you like to use?',
  choices: [{
    value: 'none',
    message: 'None',
    hint: 'Use standard CSS with no pre-processor.'
  }, {
    value: 'less',
    message: 'Less',
    hint: 'Extends the CSS language, adding features that allow variables, mixins, functions and many other techniques.'
  }, {
    value: 'sass',
    message: 'Sass',
    hint: 'A mature, stable, and powerful professional grade CSS extension.'
  }, {
    value: 'stylus',
    message: 'Stylus',
    hint: 'Expressive, dynamic and robust CSS.'
  }]
};

exports.askPostCss = {
  message: 'Do you want to add PostCSS processing',
  choices: [{
    value: 'none',
    message: 'None',
    hint: 'No PostCSS processing'
  }, {
    value: 'postcss-basic',
    message: 'Basic',
    hint: 'With autoprefixer'
  }, {
    value: 'postcss-typical',
    message: 'Typical',
    hint: 'With autoprefixer, postcss-url to inline image/font resources, cssnano to minify',
    if: 'cli-bundler'
  }, {
    value: 'postcss-typical',
    message: 'Typical',
    hint: 'With autoprefixer, plus cssnano to minify',
    // don't need postcss-url for webpack, as webpack's css-loader does similar work
    if: 'webpack'
  }]
};

exports.askUnitTestRunner = {
  message: 'Which unit test runner would you like to use?',
  choices: [{
    value: 'none',
    message: 'None',
    hint: 'Skip testing. My code is always perfect :-)'
  }, {
    value: 'karma',
    message: 'Karma + Jasmine',
    hint: 'Unit testing with Karma and Jasmine'
  }, {
    value: 'jest',
    message: 'Jest',
    hint: 'Unit testing with Jest'
  }]
};

exports.askIntegrationTestRunner = {
  message: 'Would you like to configure integration testing?',
  choices: [{
    value: 'none',
    message: 'None',
    hint: 'Skip testing. My code is always perfect :-)'
  }, {
    value: 'protractor',
    message: 'Protractor',
    hint: 'Integration testing with Protractor.'
  }, {
    value: 'cypress',
    message: 'Cypress',
    hint: "Integration testing with Cypress. Please note: If you've chosen a Typescript, Cypress will add webpack and ts-loader to dependencies due to limited availability of Cypress preprocessors at this point in time."
  }]
};

exports.askEditor = {
  message: 'What is your default code editor?',
  choices: [{
    value: 'none',
    message: 'None',
    hint: 'Skip any editor specific options.'
  }, {
    value: 'vscode',
    message: 'Visual Studio Code',
    hint: 'Code editing. Redefined. Free. Open source. Runs everywhere.'
  }]
  // Removed atom/sublime/webstorm from the editor list, because they are
  // no-ops in cli.
};

exports.askScaffold = {
  message: 'Which features do you want scaffolded into your project?',
  choices: [{
    value: 'scaffold-minimum',
    message: 'Minimum',
    hint: 'Just a bare minimum Aurelia app.'
  }, {
    value: 'scaffold-navigation',
    message: 'Navigation App',
    hint: 'Add a router and some sample routes, Bootstrap v4 and Font Awesome v4.'
  }]
};

exports.askPluginScaffold = {
  message: 'Which features do you want scaffolded into your Aurelia plugin project?',
  choices: [{
    value: 'plugin-scaffold-minimum',
    message: 'None',
    hint: 'Just a bare minimum Aurelia plugin.'
  }, {
    value: 'plugin-scaffold-basic',
    message: 'Basic',
    hint: 'Show examples for custom element, attribute, value converter and binding behavior.'
  }]
};
