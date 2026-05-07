// eslint.config.js
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
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

const tsBaseRules = {
  'no-constant-condition': 'off',
  'no-unused-vars': 'off',
  'no-console': ['warn', { allow: ['warn', 'error'] }],
  '@typescript-eslint/no-unused-vars': [
    'error',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
  ],
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-var-requires': 'off',
  'simple-import-sort/imports': 'error',
  'simple-import-sort/exports': 'error',
  'prettier/prettier': 'error',
}

const tsPlugins = {
  '@typescript-eslint': tsPlugin,
  prettier: prettierPlugin,
  'simple-import-sort': simpleImportSort,
  custom: {
    rules: {
      'no-relative-imports': noRelativeImports,
    },
  },
}

export default [
  // Apply prettier-config last in spirit by spreading its rules into the
  // base ruleset; eslint-config-prettier disables stylistic rules that
  // would conflict with prettier.
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'eslint-plugins/**'],
  },

  // Source files — full ruleset including the alias-import rule.
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: tsLanguageOptions,
    plugins: tsPlugins,
    rules: {
      ...prettierConfig.rules,
      ...tsBaseRules,
      'custom/no-relative-imports': 'error',
    },
  },

  // Tests — same ruleset; the alias rule applies here too. Test-internal
  // relative imports (e.g. `'../util/test-util'`) resolve outside `src/`
  // and are skipped by the rule, so authors don't have to special-case them.
  {
    files: ['tests/**/*.{ts,tsx}'],
    languageOptions: tsLanguageOptions,
    plugins: tsPlugins,
    rules: {
      ...prettierConfig.rules,
      ...tsBaseRules,
      'custom/no-relative-imports': 'error',
    },
  },
]
