import {
  forward,
  parseError,
  Parser,
  updateError,
  updateState,
} from '@parsil/parser'
import { getNextCharWidth, getUtf8Char } from '@parsil/util'

const digitRegex = /^\d/

/**
 * `digit` matches a single digit character `[0-9]`.
 *
 * @example
 * digit.run('1') // { isError: false, result: '1', index: 1 }
 * digit.run('a') // ParseError @ index 0 -> digit: Expected digit, but got 'a'
 *
 * @returns A parser that matches a single digit.
 */
export const digit: Parser<string> = new Parser((state) => {
  if (state.isError) return forward(state)

  const { dataView, index } = state

  if (dataView.byteLength > index) {
    const charWidth = getNextCharWidth(index, dataView)

    if (index + charWidth <= dataView.byteLength) {
      const char = getUtf8Char(index, charWidth, dataView)

      return dataView.byteLength && char && digitRegex.test(char)
        ? updateState(state, index + charWidth, char)
        : updateError(
            state,
            parseError('digit', index, `Expected digit, but got '${char}'`, {
              expected: '[0-9]',
              actual: char,
            })
          )
    }
  }

  return updateError(
    state,
    parseError('digit', index, 'Expected digit, but got end of input.', {
      expected: '[0-9]',
    })
  )
})
