### Prepare release

1. run `gulp prepare-release --bump major|minor|patch|prerelease`. This will update aurelia-cli version, update change log, update cli version in `lib/dependencies.json`.
2. do `npm publish`.
