For more information, go to https://aurelia.io/docs/cli/webpack

## Run dev app

Run `au run`, then open `http://localhost:/* @if feat.web */8080/* @endif *//* @if feat['dotnet-core'] */5000/* @endif */`

To open browser automatically, do `au run --open`.

To change dev server port, do `au run --port 8888`.

To enable Webpack Bundle Analyzer, do `au run --analyze`.

To enable hot module reload, do `au run --hmr`.

## Build for production

Run `au build --env prod`.
