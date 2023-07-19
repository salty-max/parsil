import {
  Parser,
  ParserState,
  updateError,
  updateState,
} from '../../parser/parser'
import { encoder, getCharacterLength, getString } from '../../util'

/**
 * Generates a parser that matches a specific string `s` in the input.
 * @param s - The string that the generated parser will try to match.
 * @returns A Parser instance that matches the string `s`.
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
        `ParseError (position: ${index}): Tried to match '${s}', but got unexpected end of input`
      )
    }

    const stringAtIndex = getString(index, encodedStr.byteLength, dataView)
    if (s === stringAtIndex) {
      return updateState(state, index + s.length, s)
    }

    return updateError(
      state,
      `ParseError (position: ${index}): Tried to match '${s}', but got '${stringAtIndex}...'`
    )
  })
}
