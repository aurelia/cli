For more information, go to https://aurelia.io/docs/cli/webpack

## Run dev app

Run `au run`, then open `http://localhost:/* @if feat.web */8080/* @endif *//* @if feat['dotnet-core'] */5000/* @endif */`

To open browser automatically, do `au run --open`.

To change dev server port, do `au run --port 8888`.

To change dev server host, do `au run --host 127.0.0.1`

To enable Webpack Bundle Analyzer, do `au run --analyze`.

To enable hot module reload, do `au run --hmr`.

**PS:** You could mix all the flags as well, `au run --host 127.0.0.1 --port 7070 --open --hmr`

## Build for production

Run `au build --env prod`.
