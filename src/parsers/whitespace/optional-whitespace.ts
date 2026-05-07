import { Parser } from '@parsil/parser'
import { possibly } from '@parsil/parsers/possibly'
import { whitespace } from '@parsil/parsers/whitespace/whitespace'

/**
 * `optionalWhitespace` matches optional whitespace.
 * It can return either a string containing whitespace or `null` if no whitespace is found.
 *
 * @example
 * const parser = P.optionalWhitespace;
 * parser.run('  \t\n'); // returns { isError: false, result: '  \t\n', index: 4 }
 * parser.run('abc'); // returns { isError: false, result: null, index: 0 }
 *
 * @returns {Parser<string | null>} A parser that matches optional whitespace.
 */
export const optionalWhitespace: Parser<string | null> = possibly(
  whitespace
).map((x) => x || '')
