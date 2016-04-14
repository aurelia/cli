import del from 'del';
import config from '../config.json';

export default function clean() {
  return del([config.paths.output]);
}
