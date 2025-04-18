import * as esbuild from 'esbuild';
import esbuildPluginTsc from 'esbuild-plugin-tsc';

await esbuild.build({
  entryPoints: ['src/**/*.ts', 'src/**/*.json', 'src/**/*.txt'],
  bundle: false,
  minify: true,
  sourcemap: true,
  //outfile: 'dist/aurelia-cli.cjs',
  outdir: 'dist',
  platform: 'node',
  packages: 'external',
  loader: {
    '.json': 'copy',
    '.txt': 'copy'
  },
  plugins: [
    esbuildPluginTsc()
  ]
})
