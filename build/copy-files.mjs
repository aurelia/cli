import * as cpx from 'cpx';

cpx.copy('src/**/*.json', 'dist')
  .on('copy', (e) => console.log(`Copied: ${e.srcPath}`));
  cpx.copy('src/**/*.txt', 'dist')
  .on('copy', (e) => console.log(`Copied: ${e.srcPath}`));
