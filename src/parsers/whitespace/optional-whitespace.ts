import { Parser } from '../../parser'
import { possibly } from '../possibly'
import { whitespace } from './whitespace'

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
