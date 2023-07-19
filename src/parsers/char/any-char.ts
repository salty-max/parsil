import { Parser, ParserState, updateError, updateState } from '../../parser'
import { getNextCharWidth, getUtf8Char } from '../../util'

/**
 * `anyChar` is a parser that matches any single character at the start of its input.
 * If the input starts with any character, it consumes that character and returns it.
 * If no character is found (i.e., if the input is empty or doesn't start with a character),
 * it fails with an error message indicating that an unexpected end of input has been reached.
 *
 * @example
 * anyChar.run("abcd")  // returns "a"
 * anyChar.run("1234")  // returns "1"
 * anyChar.run("")  // returns "ParseError @ index 0 -> anyChar: Expected a character, but got unexpected end of input"
 *
 * @returns {Parser<string>} A parser that matches any character.
 */
export const anyChar: Parser<string> = new Parser(
  (state): ParserState<string, string> => {
    if (state.isError) return state

    const { index, dataView } = state
    if (index < dataView.byteLength) {
      const charWidth = getNextCharWidth(index, dataView)
      if (index + charWidth <= dataView.byteLength) {
        const char = getUtf8Char(index, charWidth, dataView)
        return updateState(state, index + charWidth, char)
      }
    }

    return updateError(
      state,
      `ParseError @ index ${index} -> anyChar: Expected a character, but got unexpected end of input`
    )
  }
)
