import { Parser, updateError, updateState } from '../../parser'
import { getNextCharWidth, getUtf8Char } from '../../util'

/**
 * `anyCharExcept` matches any character except the ones matched by the given parser.
 * 
 * @example
 * anyCharExcept (char ('.')).run('This is a sentence.')
 * -> {
 *       isError: false,
 *       result: 'T',
 *       index: 1,
 *    }

 * const manyExceptDot = many(anyCharExcept(char('.')))
 * manyExceptDot.run('This is a sentence.')
 * -> {
 *      isError: false,
 *      result: ['T', 'h', 'i', 's', ' ', 'i', 's', ' ', 'a', ' ', 's', 'e', 'n', 't', 'e', 'n', 'c', 'e'],
 *      index: 18,
 *    }
 * 
 * @param parser The parser not to match
 * @returns A parser that matches any character except the ones matched by the given parser
 */
export const anyCharExcept = (parser: Parser<any>): Parser<number> =>
  new Parser(function anyCharExcept$state(state) {
    if (state.isError) return state
    const { dataView, index } = state

    const out = parser.p(state)
    if (out.isError) {
      if (index < dataView.byteLength) {
        const charWidth = getNextCharWidth(index, dataView)
        if (index + charWidth <= dataView.byteLength) {
          const char = getUtf8Char(index, charWidth, dataView)
          return updateState(state, index + charWidth, char)
        }
      }
      return updateError(
        state,
        `ParseError @ index ${index} -> anyCharExcept: Unexpected end of input`
      )
    }

    return updateError(
      state,
      `ParseError @ index ${index} -> anyCharExcept: Matched '${out.result}' from the exception parser`
    )
  })
