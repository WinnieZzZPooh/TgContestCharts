import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';
import json from 'rollup-plugin-json';


export default args => ({
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
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
    uglify(),
    filesize()
  ]
});
