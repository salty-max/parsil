import {
  forward,
  parseError,
  Parser,
  updateError,
  updateState,
} from '@parsil/parser'
import { getNextCharWidth, getUtf8Char } from '@parsil/util'

const letterRegex = /^[A-Za-z]/

/**
 * `letter` matches a single ASCII alphabetic character.
 *
 * @example
 * letter.run('a') // { isError: false, result: 'a', index: 1 }
 * letter.run('1') // ParseError @ index 0 -> letter: Expected letter, but got '1'
 *
 * @returns A parser that matches a single ASCII letter.
 */
export const letter: Parser<string> = new Parser((state) => {
  if (state.isError) return forward(state)

  const { index, dataView } = state

  if (dataView.byteLength > index) {
    const charWidth = getNextCharWidth(index, dataView)
    if (index + charWidth <= dataView.byteLength) {
      const char = getUtf8Char(index, charWidth, dataView)
      return dataView.byteLength && char && letterRegex.test(char)
        ? updateState(state, index + charWidth, char)
        : updateError(
            state,
            parseError('letter', index, `Expected letter, but got '${char}'`, {
              expected: '[A-Za-z]',
              actual: char,
            })
          )
    }
  }

  return updateError(
    state,
    parseError('letter', index, 'Expected letter, but got end of input.', {
      expected: '[A-Za-z]',
    })
  )
})
