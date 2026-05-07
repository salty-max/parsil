import { parseError, Parser } from '@parsil/parser'
import { regex } from '@parsil/parsers/regex'

/**
 * Match an integer literal: optional sign + digits. Returns the JS
 * `number` value.
 *
 * @example
 * intLit.run('42')    // result: 42
 * intLit.run('-7x')   // result: -7
 * intLit.run('+0')    // result: 0
 * intLit.run('abc')   // ParseError: Expected an integer literal
 *
 * @returns A parser yielding the parsed integer.
 */
export const intLit: Parser<number> = regex(/^[+-]?\d+/)
  .map((s) => Number(s))
  .errorMap(({ index }) =>
    parseError('intLit', index, 'Expected an integer literal', {
      expected: '[+-]?[0-9]+',
    })
  )
