import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'

export default [
  {
    input: './src/index.ts',
    output: {
      file: './dist/index.js',
      format: 'cjs',
    },
    plugins: [typescript({ target: 'ES6' })],
  },
  {
    input: './src/index.ts',
    output: {
      file: './dist/index.mjs',
      format: 'es',
    },
    plugins: [typescript({ target: 'ES2020' })],
  },
  {
    input: './src/index.ts',
    output: {
      file: './dist/index.d.ts',
      format: 'cjs',
    },
    plugins: [typescript(), dts()],
  },
]
