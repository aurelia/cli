import gulp from 'gulp';
import minimatch from 'minimatch';
import gulpWatch from 'gulp-watch';
import debounce from 'debounce';
import { build } from 'aurelia-cli';
import project from '../aurelia.json';
import transpile from './transpile';
import processMarkup from './process-markup';
import processCSS from './process-css';
import copyFiles from './copy-files';

const debounceWaitTime = 100;
let isBuilding = false;
let pendingRefreshPaths = [];
let watches = {};
let watchCallback = () => { };

watches[project.transpiler.source] = { name: 'transpile', callback: transpile };
watches[project.markupProcessor.source] = { name: 'markup', callback: processMarkup };
watches[project.cssProcessor.source] = { name: 'CSS', callback: processCSS };
if (typeof project.build.copyFiles === 'object') {
  for (let src of Object.keys(project.build.copyFiles)) {
    watches[src] = { name: 'file copy', callback: copyFiles };
  }
}

let watch = (callback) => {
  watchCallback = callback || watchCallback;
  return gulpWatch(
    Object.keys(watches),
    {
      read: false, // performance optimization: do not read actual file contents
      verbose: true
    },
    (vinyl) => {
      if (vinyl.path && vinyl.cwd && vinyl.path.startsWith(vinyl.cwd)) {
        let pathToAdd = vinyl.path.substr(vinyl.cwd.length + 1);
        log(`Watcher: Adding path ${pathToAdd} to pending build changes...`);
        pendingRefreshPaths.push(pathToAdd);
        refresh();
      }
    });
};

let refresh = debounce(() => {
  if (isBuilding) {
    log('Watcher: A build is already in progress, deferring change detection...');
    return;
  }

  isBuilding = true;

  let paths = pendingRefreshPaths.splice(0);
  let refreshTasks = [];

  // Dynamically compose tasks
  for (let src of Object.keys(watches)) {
    if (paths.find((x) => minimatch(x, src))) {
      log(`Watcher: Adding ${watches[src].name} task to next build...`);
      refreshTasks.push(watches[src].callback);
    }
  }

  if (refreshTasks.length === 0) {
    log('Watcher: No relevant changes found, skipping next build.');
    isBuilding = false;
    return;
  }

  let toExecute = gulp.series(
    readProjectConfiguration,
    gulp.parallel(refreshTasks),
    writeBundles,
    (done) => {
      isBuilding = false;
      watchCallback();
      done();
      if (pendingRefreshPaths.length > 0) {
        log('Watcher: Found more pending changes after finishing build, triggering next one...');
        refresh();
      }
    }
  );

  toExecute();
}, debounceWaitTime);

function log(message) {
  console.log(message);
}

function readProjectConfiguration() {
  return build.src(project);
}

function writeBundles() {
  return build.dest();
}

export default watch;