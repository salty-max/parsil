import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * ESLint rule to forbid relative imports (`./` and `../`) in source files.
 *
 * Autofixes each violation to the equivalent `@parsil/*` alias based on
 * the alias declared in `tsconfig.json`: `@parsil/*` -> `./src/*`.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC_ROOT = path.resolve(__dirname, '..', 'src')

/**
 * Convert a file's relative import specifier to its `@parsil/*` alias.
 *
 * @param {string} fromFile Absolute path of the file doing the import.
 * @param {string} specifier The relative specifier (e.g. './foo').
 * @returns {string | null} Aliased specifier, or null if target lives outside `src/`.
 */
function relativeToAlias(fromFile, specifier) {
  const resolved = path.resolve(path.dirname(fromFile), specifier)

  // Only rewrite when the target lives under `src/`. Anything else
  // (tests, configs, fixtures) is left to the reviewer to handle.
  const rel = path.relative(SRC_ROOT, resolved)
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null

  // Strip extensions so imports stay module-style; tsc + bun resolve the file.
  const withoutExt = rel.replace(/\.(ts|tsx|js|jsx|mjs|cjs)$/, '')

  // Targeting the src root (the dir or its index file) maps to the
  // bare `@parsil` alias — the public package entry as a consumer sees it.
  if (withoutExt === '' || withoutExt === 'index') return '@parsil'

  // Posix separators for cross-platform consistency.
  return `@parsil/${withoutExt.split(path.sep).join('/')}`
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid relative imports — use the @parsil/* path alias.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      forbidden:
        'Do not use relative imports. Use the "@parsil/*" path alias instead{{suggestion}}.',
    },
  },
  create(context) {
    const report = (node) => {
      const source = node.source.value
      if (typeof source !== 'string') return
      if (!source.startsWith('./') && !source.startsWith('../')) return

      const filename = context.filename ?? context.getFilename()
      const alias = relativeToAlias(filename, source)

      // Imports that resolve outside `src/` (e.g. test-internal helpers
      // like `'../util/test-util'`) cannot be aliased and are left alone.
      if (alias === null) return

      context.report({
        node: node.source,
        messageId: 'forbidden',
        data: { suggestion: ` (e.g. "${alias}")` },
        fix: (fixer) => {
          const quote = node.source.raw[0]
          return fixer.replaceText(node.source, `${quote}${alias}${quote}`)
        },
      })
    }

    return {
      ImportDeclaration: report,
      ExportNamedDeclaration(node) {
        if (node.source) report(node)
      },
      ExportAllDeclaration: report,
    }
  },
}

export default rule
