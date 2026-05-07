import { parseError, Parser } from '@parsil/parser/parser'
import { regex } from '@parsil/parsers/regex'

const digitsRegex = /^\d+/

/**
 * `digits` matches one or more digit characters at the start of the
 * input. On failure, emits a structured `ParseError` with `parser:
 * 'digits'`.
 *
 * @example
 * digits.run('123abc') // result: '123'
 * digits.run('abc123') // ParseError @ index 0 -> digits: Expected digits
 *
 * @returns A parser that matches one or more digit characters.
 */
export const digits: Parser<string> = regex(digitsRegex).errorMap(({ index }) =>
  parseError('digits', index, 'Expected digits', { expected: '[0-9]+' })
)
