import * as del from 'del';
import * as project from '../aurelia.json';

export default function clean() {
  return del([project.paths.output]);
}
