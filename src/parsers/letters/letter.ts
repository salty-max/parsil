import { Parser, updateError, updateState } from '../../parser'
import { getNextCharWidth, getUtf8Char } from '../../util'

const letterRegex = /^[A-Za-z]/

/**
 * `letter` reads a single letter from the input.
 * It matches any uppercase or lowercase letter from the English alphabet.
 *
 * @example
 * const parser = letter;
 * parser.run('a'); // returns { isError: false, result: 'a', index: 1 }
 * parser.run('1'); // returns { isError: true, error: "ParseError @ index 0 -> letter: Expecting letter, got '1'", index: 0 }
 *
 * @returns {Parser<string>} A parser that reads a single letter from the input.
 */
export const letter: Parser<string> = new Parser((state) => {
  if (state.isError) return state

  const { index, dataView } = state

  if (dataView.byteLength > index) {
    const charWidth = getNextCharWidth(index, dataView)
    if (index + charWidth <= dataView.byteLength) {
      const char = getUtf8Char(index, charWidth, dataView)
      return dataView.byteLength && char && letterRegex.test(char)
        ? updateState(state, index + charWidth, char)
        : updateError(
            state,
            `ParseError @ index ${index} -> letter: Expecting letter, got '${char}'`
          )
    }
  }

  return updateError(
    state,
    `ParseError @ index ${index} -> letter: Expecting letter, but got end of input.`
  )
})
