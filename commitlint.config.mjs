/**
 * Conventional-commit config for parsil.
 *
 * Scopes mix two sources:
 * - `parsers/<name>` is auto-generated from `src/parsers/` directories.
 *   The directory name is the scope, no design decision involved.
 * - The rest are hand-listed because they carry semantic weight
 *   (`parser` = the Parser class, `meta` = top-level repo files, etc.).
 *
 * Auto-generation means a new parser scope is enabled the moment its
 * directory exists. A typo (`parsers/letterz`) is rejected because no
 * such directory exists at lint time.
 *
 * See `CLAUDE.md` -> "Commit Convention" for the full policy.
 */

import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PARSERS_ROOT = path.resolve(__dirname, 'src/parsers')

const parserScopes = readdirSync(PARSERS_ROOT)
  .filter((entry) =>
    statSync(path.join(PARSERS_ROOT, entry)).isDirectory()
  )
  .map((dir) => `parsers/${dir}`)
  .sort()

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [2, 'never'],
    'scope-enum': [
      2,
      'always',
      [
        'parser',
        ...parserScopes,
        'util',
        'deps',
        'tooling',
        'ci',
        'docs',
        'meta',
      ],
    ],
  },
}
