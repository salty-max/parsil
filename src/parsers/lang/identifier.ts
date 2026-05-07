import { parseError, Parser } from '@parsil/parser'
import { regex } from '@parsil/parsers/regex'

const identRegex = /^[A-Za-z_]\w*/

/**
 * Match a programming-language style identifier:
 * `[A-Za-z_][A-Za-z0-9_]*`. Useful for variable names, function names,
 * keywords (when paired with {@link import('@parsil/parsers/lexeme').keyword}).
 *
 * @example
 * identifier.run('foo_bar 42')  // result: 'foo_bar'
 * identifier.run('_x')          // result: '_x'
 * identifier.run('123foo')      // ParseError: Expected an identifier
 *
 * @returns A parser that matches one identifier.
 */
export const identifier: Parser<string> = regex(identRegex).errorMap(
  ({ index }) =>
    parseError('identifier', index, 'Expected an identifier', {
      expected: '[A-Za-z_][A-Za-z0-9_]*',
    })
)
