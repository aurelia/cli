const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const project = require('./aurelia_project/aurelia.json');
const { AureliaPlugin, ModuleDependenciesPlugin } = require('aurelia-webpack-plugin');
const { ProvidePlugin } = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

// config helpers:
const ensureArray = (config) => config && (Array.isArray(config) ? config : [config]) || [];
const when = (condition, config, negativeConfig) =>
  condition ? ensureArray(config) : ensureArray(negativeConfig);

// primary config:
const title = 'Aurelia Navigation Skeleton';
const outDir = path.resolve(__dirname, project.platform.output);
const srcDir = path.resolve(__dirname, 'src');
const nodeModulesDir = path.resolve(__dirname, 'node_modules');
const baseUrl = '/';

const cssRules = [
  { loader: 'css-loader' },
  // @if cssProcessor.id='postcss'
  {
    loader: 'postcss-loader',
    options: { plugins: () => [require('autoprefixer')({ browsers: ['last 2 versions'] })]}
  }
  // @endif
];

module.exports = ({production, server, extractCss, coverage, analyze, karma} = {}) => ({
  resolve: {
    // @if transpiler.id='typescript'
    extensions: ['.ts', '.js'],
    // @endif
    // @if transpiler.id='babel'
    extensions: ['.js'],
    // @endif
    modules: [srcDir, 'node_modules'],
    // Enforce single aurelia-binding, to avoid v1/v2 duplication due to
    // out-of-date dependencies on 3rd party aurelia plugins
    alias: { 'aurelia-binding': path.resolve(__dirname, 'node_modules/aurelia-binding') }
  },
  entry: {
    app: ['aurelia-bootstrapper']
  },
  mode: production ? 'production' : 'development',
  output: {
    path: outDir,
    publicPath: baseUrl,
    filename: production ? '[name].[chunkhash].bundle.js' : '[name].[hash].bundle.js',
    sourceMapFilename: production ? '[name].[chunkhash].bundle.map' : '[name].[hash].bundle.map',
    chunkFilename: production ? '[name].[chunkhash].chunk.js' : '[name].[hash].chunk.js'
  },
  optimization: {
    // Use splitChunks to breakdown the vendor bundle into smaller files
    // https://webpack.js.org/plugins/split-chunks-plugin/
    splitChunks: { 
      chunks: "initial",
      cacheGroups: {
        default: false, // Disable the built-in groups (default and vendors)
        vendors: false,
        bluebird: {
          test: /[\\/]node_modules[\\/]bluebird[\\/]/,
          name: "vendor.bluebird",
          enforce: true,
          priority: 100
        },
        // You can insert additional entries here for jQuery and bootstrap etc. if you need them
        // Break the Aurelia bundle down into smaller chunks, binding and templating are the largest
        aureliaBinding: {
          test: /[\\/]node_modules[\\/]aurelia-binding[\\/]/,
          name: "vendor.aurelia-binding",
          enforce: true,
          priority: 28
        },
        aureliaTemplating: {
          test: /[\\/]node_modules[\\/]aurelia-templating[\\/]/,
          name: "vendor.aurelia-templating",
          enforce: true,
          priority: 26
        },
        aurelia: {
          test: /[\\/]node_modules[\\/]aurelia-.*[\\/]/,
          name: "vendor.aurelia",
          enforce: true,
          priority: 20
        },
        // This picks up everything else being used from node_modules
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          enforce: true,
          priority: 10
        },
        common: { // common chunk
          name: 'common',
          minChunks: 2,   // Creates a new chunk if a module is shared between different chunks more than twice
          chunks: 'async',
          priority: 0,
          reuseExistingChunk: true,
          enforce: true
        }
      }
    }
  },
  performance: { hints: false },
  devServer: {
    contentBase: outDir,
    // serve index.html for all 404 (required for push-state)
    historyApiFallback: true
  },
  devtool: production ? 'nosources-source-map' : 'cheap-module-eval-source-map',
  module: {
    rules: [
      // CSS required in JS/TS files should use the style-loader that auto-injects it into the website
      // only when the issuer is a .js/.ts file, so the loaders are not applied inside html templates
      {
        test: /\.css$/i,
        issuer: [{ not: [{ test: /\.html$/i }] }],
        use: extractCss ? [{
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader'
        ] : ['style-loader', ...cssRules]
      },
      {
        test: /\.css$/i,
        issuer: [{ test: /\.html$/i }],
        // CSS required in templates cannot be extracted safely
        // because Aurelia would try to require it again in runtime
        use: cssRules
      },
      // @if cssProcessor.id='less'
      {
        test: /\.less$/i,
        use: ['style-loader', 'css-loader', 'less-loader'],
        issuer: /\.[tj]s$/i
      },
      {
        test: /\.less$/i,
        use: ['css-loader', 'less-loader'],
        issuer: /\.html?$/i
      },
      // @endif
      // @if cssProcessor.id='stylus'
      {
        test: /\.styl$/i,
        use: ['style-loader', 'css-loader', 'stylus-loader'],
        issuer: /\.[tj]s$/i
      },
      {
        test: /\.styl$/i,
        use: ['css-loader', 'stylus-loader'],
        issuer: /\.html?$/i
      },
      // @endif
      // @if cssProcessor.id='sass'
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        issuer: /\.[tj]s$/i
      },
      {
        test: /\.scss$/,
        use: ['css-loader', 'sass-loader'],
        issuer: /\.html?$/i
      },
      // @endif
      { test: /\.html$/i, loader: 'html-loader' },
      // @if transpiler.id='babel'
      { test: /\.js$/i, loader: 'babel-loader', exclude: nodeModulesDir,
        options: coverage ? { sourceMap: 'inline', plugins: [ 'istanbul' ] } : {},
      },
      // @endif
      // @if transpiler.id='typescript'
      { test: /\.ts$/, loader: "ts-loader" },
      // @endif
      // use Bluebird as the global Promise implementation:
      { test: /[\/\\]node_modules[\/\\]bluebird[\/\\].+\.js$/, loader: 'expose-loader?Promise' },
      // embed small images and fonts as Data Urls and larger ones as files:
      { test: /\.(png|gif|jpg|cur)$/i, loader: 'url-loader', options: { limit: 8192 } },
      { test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff2' } },
      { test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff' } },
      // load these fonts normally, as files:
      { test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'file-loader' },
      // @if transpiler.id='typescript'
      ...when(coverage, {
        test: /\.[jt]s$/i, loader: 'istanbul-instrumenter-loader',
        include: srcDir, exclude: [/\.{spec,test}\.[jt]s$/i],
        enforce: 'post', options: { esModules: true },
      })
      // @endif
    ]
  },
  plugins: [
    ...when(!karma, new DuplicatePackageCheckerPlugin()),
    new AureliaPlugin(),
    new ProvidePlugin({
      'Promise': 'bluebird'
    }),
    new ModuleDependenciesPlugin({
      'aurelia-testing': [ './compile-spy', './view-spy' ]
    }),
    new HtmlWebpackPlugin({
      template: 'index.ejs',
      // @if markupProcessor.id='minimum'
      minify: production ? {
        removeComments: true,
        collapseWhitespace: true
      } : undefined,
      // @endif
      // @if markupProcessor.id='maximum'
      minify: production ? {
        removeComments: true,
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        minifyCSS: true,
        minifyJS: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        ignoreCustomFragments: [/\${.*?}/g]
      } : undefined,
      // @endif
      metadata: {
        // available in index.ejs //
        title, server, baseUrl
      }
    }),
    ...when(extractCss, new MiniCssExtractPlugin({
      filename: production ? '[contenthash].css' : '[id].css',
      allChunks: true
    })),
    ...when(production || server, new CopyWebpackPlugin([
      { from: 'static', to: outDir }])),
    ...when(analyze, new BundleAnalyzerPlugin())
  ]
});
