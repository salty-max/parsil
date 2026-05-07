import { Parser } from '@parsil/parser'
import { possibly } from '@parsil/parsers/possibly'
import { whitespace } from '@parsil/parsers/whitespace/whitespace'

/**
 * `optionalWhitespace` matches optional whitespace, returning the matched
 * substring or an empty string when whitespace is absent. The result is
 * always a string — never `null` — so call sites can use it without
 * narrowing.
 *
 * @example
 * const parser = P.optionalWhitespace;
 * parser.run('  \t\n'); // { isError: false, result: '  \t\n', index: 4 }
 * parser.run('abc');    // { isError: false, result: '',       index: 0 }
 *
 * @returns A parser that matches optional whitespace and never produces null.
 */
export const optionalWhitespace: Parser<string> = possibly(whitespace).map(
  (x) => x || ''
)
