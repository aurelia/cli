For more information, go to https://aurelia.io/docs/cli/cli-bundler

## Run dev app

Run `au run`, then open `http://localhost:/* @if feat.web */9000/* @endif *//* @if feat['dotnet-core'] */5000/* @endif */`

To open browser automatically, do `au run --open`.

To change dev server port, do `au run --port 8888`.

To change dev server host, do `au run --host 127.0.0.1`

// @if feat.babel
To install new npm packages automatically, do `au run --auto-install`
// @endif

**PS:** You could mix all the flags as well, `au run --host 127.0.0.1 --port 7070 --open`

// @if !feat.plugin
## Build for production

Run `au build --env prod`.
// @endif
