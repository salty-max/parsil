// eslint.config.js
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import noRelativeImports from './eslint-plugins/no-relative-imports.js'

const tsLanguageOptions = {
  parser: tsParser,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  globals: {
    process: 'readonly',
    __dirname: 'readonly',
    __filename: 'readonly',
    module: 'readonly',
    require: 'readonly',
  },
}

const tsRules = {
  'no-constant-condition': 'off',
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': [
    'error',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
  ],
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-var-requires': 'off',
}

export default [
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      'eslint-plugins/**',
    ],
  },

  // Source files — full ruleset including the alias-import rule.
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: tsLanguageOptions,
    plugins: {
      '@typescript-eslint': tsPlugin,
      custom: {
        rules: {
          'no-relative-imports': noRelativeImports,
        },
      },
    },
    rules: {
      ...tsRules,
      'custom/no-relative-imports': 'error',
    },
  },

  // Tests — same baseline, but tests live outside src/ and import the
  // public surface via a relative path. The alias rule does not apply.
  {
    files: ['tests/**/*.{ts,tsx}'],
    languageOptions: tsLanguageOptions,
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: tsRules,
  },
]
