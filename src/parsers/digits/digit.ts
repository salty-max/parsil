import { Parser, updateError, updateState } from '../../parser'
import { getNextCharWidth, getUtf8Char } from '../../util'

const digitRegex = /^[0-9]/

/**
 * `digit` reads a single digit from the input.
 * It matches any numeric digit character from 0 to 9.
 *
 * @example
 * const parser = digit;
 * parser.run('1'); // returns { isError: false, result: '1', index: 1 }
 * parser.run('a'); // returns { isError: true, error: "ParseError @ index 0 -> digit: Expecting digit, got 'a'", index: 0 }
 *
 * @returns {Parser<string>} A parser that reads a single digit from the input.
 */
export const digit: Parser<string> = new Parser((state) => {
  if (state.isError) return state

  const { dataView, index } = state

  if (dataView.byteLength > index) {
    const charWidth = getNextCharWidth(index, dataView)

    if (index + charWidth <= dataView.byteLength) {
      const char = getUtf8Char(index, charWidth, dataView)

      return dataView.byteLength && char && digitRegex.test(char)
        ? updateState(state, index + charWidth, char)
        : updateError(
            state,
            `ParseError @ index ${index} -> digit: Expecting digit, got '${char}'`
          )
    }
  }

  return updateError(
    state,
    `ParseError @ index ${index} -> digit: Expecting digit, but got end of input.`
  )
})
