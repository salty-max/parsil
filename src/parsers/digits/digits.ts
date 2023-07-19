import { Parser } from '../../parser/parser'
import { regex } from '../regex'

const digitsRegex = /^[0-9]+/

/**
 * `digits` is a parser that matches one or more digit characters at the start of its input,
 * using a regular expression. If it finds a match, it consumes the matched characters and returns them as a string.
 * If no match is found, it fails with an error message.
 *
 * @example
 * digits.run("123abc")  // returns "123"
 * digits.run("abc123")  // returns "ParseError @ index 0 -> digits: Expected digits"
 *
 * @returns {Parser<string>} A parser that matches one or more digit characters.
 */
export const digits: Parser<string> = regex(digitsRegex).errorMap(
  ({ index }) => `ParseError @ index ${index} -> digits: Expected digits`
)
