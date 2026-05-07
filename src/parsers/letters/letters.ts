import { parseError, Parser } from '@parsil/parser/parser'
import { regex } from '@parsil/parsers/regex'

const lettersRegex = /^[A-Za-z]+/

/**
 * `letters` matches one or more ASCII alphabetic characters at the
 * start of the input. On failure, emits a structured `ParseError` with
 * `parser: 'letters'`.
 *
 * @example
 * letters.run('abcd1234') // result: 'abcd'
 * letters.run('1234abcd') // ParseError @ index 0 -> letters: Expected letters
 *
 * @returns A parser that matches one or more ASCII alphabetic characters.
 */
export const letters: Parser<string> = regex(lettersRegex).errorMap(
  ({ index }) =>
    parseError('letters', index, 'Expected letters', { expected: '[A-Za-z]+' })
)
