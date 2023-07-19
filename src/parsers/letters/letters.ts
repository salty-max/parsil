import { Parser } from '../../parser/parser'
import { regex } from '../regex'

const lettersRegex = /^[A-Za-z]+/

/**
 * `letters` is a parser that tries to match one or more alphabetic characters at the start of its input.
 * If the input starts with one or more letters, it consumes the matched characters and returns them.
 * If the input doesn't start with a letter, it fails with an error message indicating where the mismatch occurred.
 *
 * This parser uses a regular expression to define what it considers a "letter".
 * By default, it considers both uppercase and lowercase letters from any language.
 *
 * @example
 * letters.run("abcd1234")  // returns "abcd"
 * letters.run("1234abcd")  // returns "ParseError @ index 0 -> letters: Expected letters"
 *
 * @returns {Parser<string>} A parser that tries to match one or more alphabetic characters.
 */
export const letters: Parser<string> = regex(lettersRegex).errorMap(
  ({ index }) => `ParseError @ index ${index} -> letters: Expected letters`
)
