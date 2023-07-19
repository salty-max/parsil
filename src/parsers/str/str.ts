import {
  Parser,
  ParserState,
  updateError,
  updateState,
} from '../../parser/parser'
import { encoder, getCharacterLength, getString } from '../../util'

/**
 * `str` is a parser that tries to match a given input string `s` against its input.
 * If the input starts with `s`, it returns an `Ok` result with `s` as the result and the next position in the input.
 * Otherwise, it fails and returns an `Err` with an error message indicating where the mismatch occurred.
 * An error is also thrown if `str` is called without a string or with an empty string.
 *
 * @example
 * const parser = str("abcd")
 * parser.run("abcd1234")  // returns { isError: false, result: "abcd", index: 4 }
 * parser.run("1234abcd")  // returns { isError: true, error: "ParseError @ index 0 -> str: Tried to match 'abcd', but got '1234...'", index: 0 }
 * str("")  // throws `str must be called with a string with length > 1, but got ''`
 *
 * @param s The string to match against the input.
 * @throws {TypeError} If `s` is not a string or is an empty string.
 * @return {Parser<string>} A parser that tries to match the input against `s`.
 */
export const str = (s: string): Parser<string> => {
  if (!s || getCharacterLength(s) < 1) {
    throw new TypeError(
      `str must be called with a string with length > 1, but got '${s}'`
    )
  }

  const encodedStr = encoder.encode(s)

  return new Parser((state): ParserState<string, string> => {
    const { dataView, index, isError } = state

    if (isError) return state

    const remainingBytes = dataView.byteLength - index

    if (remainingBytes < encodedStr.byteLength) {
      return updateError(
        state,
        `ParseError @ index ${index} -> str: Tried to match '${s}', but got unexpected end of input`
      )
    }

    const stringAtIndex = getString(index, encodedStr.byteLength, dataView)
    if (s === stringAtIndex) {
      return updateState(state, index + s.length, s)
    }

    return updateError(
      state,
      `ParseError @ index ${index} -> str: Tried to match '${s}', but got '${stringAtIndex}...'`
    )
  })
}
