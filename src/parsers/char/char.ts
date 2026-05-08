import {
  forward,
  ParseError,
  parseError,
  Parser,
  ParserState,
  updateError,
  updateState,
} from '@parsil/parser'
import { getCharacterLength, getNextCharWidth, getUtf8Char } from '@parsil/util'

/**
 * `char` is a parser that matches a given input character `c` at the start of its input.
 * If the input starts with `c`, it consumes the matched character and returns it.
 * If no match is found, it fails with an error message indicating where the mismatch occurred.
 * An error is also thrown if `char` is called without a string of length 1.
 *
 * @example
 * const parser = char("a")
 * parser.run("abcd")  // returns "a"
 * parser.run("1234")  // returns "ParseError @ index 0 -> char: Expected 'a', but got '1'"
 * char("ab")  // throws `char must be called with a single character, but got 'ab'`
 *
 * @param c The character to match against the input.
 * @throws {TypeError} If `c` is not a string of length 1.
 * @returns A parser that tries to match the input against `c`.
 */
export const char = (c: string): Parser<string> => {
  if (!c || getCharacterLength(c) !== 1) {
    throw new TypeError(
      `char must be called with a single character, but got '${c}'`
    )
  }

  return new Parser<string>((state): ParserState<string, ParseError> => {
    if (state.isError) return forward(state)

    const { index, dataView } = state
    if (index < dataView.byteLength) {
      const charWidth = getNextCharWidth(index, dataView)
      if (index + charWidth <= dataView.byteLength) {
        const char = getUtf8Char(index, charWidth, dataView)
        if (char === c) {
          return updateState(state, index + charWidth, c)
        }

        return updateError(
          state,
          parseError('char', index, `Expected '${c}', but got '${char}'`, {
            expected: c,
            actual: char,
          })
        )
      }
    }

    return updateError(
      state,
      parseError(
        'char',
        index,
        `Expected '${c}', but got unexpected end of input`,
        { expected: c }
      )
    )
  })
}
