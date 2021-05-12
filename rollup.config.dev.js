import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import json from 'rollup-plugin-json';


const outputDir = 'tmp';

export default args => ({
  input: 'src/index.js',
  output: {
    file: `${outputDir}/bundle.js`,
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    json({
      compact: true,
      namedExports: false
    }),
    resolve(),
    babel(),
    serve({
      contentBase: '',
      port: 9000
    }),
    livereload({
      delay: 750,
      watch: outputDir
    }),
  ]
});
