import gulp from 'gulp';
import path from 'path';
import project from '../aurelia.json';

export default function copyFiles(done) {
  const filesToCopy = project.build.copyFiles;
  if (!filesToCopy) {
    done();
    return;
  }
 
  for (let file in filesToCopy) {
    const source = path.posix.join(project.paths.root, file);
    const target = path.posix.join(project.platform.output, filesToCopy[file]);
    console.log(`Copying ${source} to ${target}`);
    gulp.src(source).pipe(gulp.dest(target));
  }
 
  done();
}
