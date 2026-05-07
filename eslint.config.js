// eslint.config.js
import prettierConfig from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import jsdocPlugin from 'eslint-plugin-jsdoc'
import prettierPlugin from 'eslint-plugin-prettier'
import * as regexpPlugin from 'eslint-plugin-regexp'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unicornPlugin from 'eslint-plugin-unicorn'
import tseslint from 'typescript-eslint'

import noRelativeImports from './eslint-plugins/no-relative-imports.js'

const sharedRules = {
  // Carry-overs from the original config — keep parsil's ergonomics intact.
  'no-constant-condition': 'off',
  'no-unused-vars': 'off',
  'no-console': ['warn', { allow: ['warn', 'error'] }],
  '@typescript-eslint/no-unused-vars': [
    'error',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
  ],
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-non-null-assertion': 'off',

  // The Parser internals traverse `ParserState<any, any>` by design;
  // 'no-unsafe-*' fires on every state mutation and obscures real issues.
  // Keep them off until the core types get a stricter overhaul.
  '@typescript-eslint/no-unsafe-return': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-unsafe-argument': 'off',

  // Parser error messages interpolate generic results (`T`) and parser
  // instances into strings; that's the whole point. Forcing `String(x)`
  // everywhere is friction without payoff.
  '@typescript-eslint/restrict-template-expressions': 'off',

  // The `coroutine` parser uses `throw nextState` as a control-flow
  // primitive (ParserState is the carrier, not an Error). The pattern
  // is intentional and contained.
  '@typescript-eslint/only-throw-error': 'off',

  // Imports / exports.
  'simple-import-sort/imports': 'error',
  'simple-import-sort/exports': 'error',
  'import/no-cycle': ['error', { maxDepth: 10 }],
  'import/no-duplicates': 'error',
  'import/no-self-import': 'error',
  'import/first': 'error',
  'import/newline-after-import': 'error',

  // Prettier integration.
  'prettier/prettier': 'error',

  // Regexp — low-value stylistic rules off; the rest still catches
  // real regex bugs.
  'regexp/use-ignore-case': 'off',

  // Unicorn — opinionated, curated to drop noise.
  'unicorn/prefer-node-protocol': 'error',
  'unicorn/prefer-string-starts-ends-with': 'error',
  'unicorn/prefer-includes': 'error',
  'unicorn/prefer-module': 'error',
  'unicorn/prefer-spread': 'error',
  'unicorn/no-array-callback-reference': 'off', // legitimate in combinator code
  'unicorn/prevent-abbreviations': 'off', // 'arg', 'args', 'fn', 'props' are fine
  'unicorn/no-null': 'off', // null is meaningful in result envelopes
  'unicorn/filename-case': ['error', { case: 'kebabCase' }],
  'unicorn/no-array-reduce': 'off', // reduce is idiomatic in combinators
  'unicorn/prefer-ternary': 'off', // a if/else block is often clearer
  'unicorn/no-useless-undefined': 'off', // undefined is a legitimate signal
  'unicorn/no-array-for-each': 'off', // forEach is fine for side effects
}

const srcRules = {
  ...sharedRules,
  'custom/no-relative-imports': 'error',

  // JSDoc — validate what's there, don't require new docs (a separate
  // doc PR can add JSDoc to undocumented helpers later).
  'jsdoc/require-jsdoc': 'off',
  'jsdoc/require-description': 'off',
  'jsdoc/require-param': 'off',
  'jsdoc/require-param-description': 'off',
  'jsdoc/require-returns': 'off',
  'jsdoc/require-returns-description': 'off',
  'jsdoc/check-param-names': 'error',
  'jsdoc/check-tag-names': 'error', // catches '@return' instead of '@returns'
  'jsdoc/check-types': 'error',
  'jsdoc/no-types': 'error', // TS already provides types; redundant in JSDoc
  'jsdoc/no-undefined-types': 'off', // generic params (T, V, S) trip this
  'jsdoc/tag-lines': 'off', // prettier handles spacing
  'jsdoc/reject-any-type': 'off', // `any` is part of parsil's internal API
  'jsdoc/informative-docs': 'off',
}

const testRules = {
  ...sharedRules,
  'custom/no-relative-imports': 'error',
  // Tests don't need JSDoc; they don't need filename-case enforcement either,
  // but spec files already follow kebab-case so this is a no-op there.
}

const sharedPlugins = {
  prettier: prettierPlugin,
  'simple-import-sort': simpleImportSort,
  import: importPlugin,
  unicorn: unicornPlugin,
  custom: {
    rules: {
      'no-relative-imports': noRelativeImports,
    },
  },
}

export default [
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'eslint-plugins/**'],
  },

  // Source files — full ruleset including type-checked rules and JSDoc.
  ...tseslint.config({
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      jsdocPlugin.configs['flat/recommended-typescript'],
      regexpPlugin.configs['flat/recommended'],
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    plugins: {
      ...sharedPlugins,
      jsdoc: jsdocPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      ...srcRules,
    },
  }),

  // Tests — recommended (no type-checked, no jsdoc), alias rule still applies.
  ...tseslint.config({
    files: ['tests/**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommended,
      regexpPlugin.configs['flat/recommended'],
    ],
    languageOptions: {
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    plugins: sharedPlugins,
    rules: {
      ...prettierConfig.rules,
      ...testRules,
    },
  }),
]
