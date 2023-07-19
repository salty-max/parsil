const typescript = require('rollup-plugin-typescript2')
const resolve = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')

module.exports = {
  input: 'src/index.ts', // your main TypeScript file
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs', // output as CommonJS module, for Node.js
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm', // output as ES module, for browsers
    },
  ],
  plugins: [
    typescript(), // transpile TypeScript
    resolve(), // resolve Node.js modules
    commonjs(), // convert CommonJS to ES modules
  ],
}
