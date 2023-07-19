import {
  Parser,
  ParserState,
  updateParserError,
  updateParserState,
} from '../parser/parser'

/**
 * Generates a parser that matches a specific string `s` in the input.
 * @param s - The string that the generated parser will try to match.
 * @returns A Parser instance that matches the string `s`.
 */
export const str = (s: string): Parser<string> =>
  new Parser<string>((state: ParserState<string>): ParserState<string> => {
    const { target, index, isError } = state

    if (isError) return state

    if (typeof target !== 'string') {
      return updateParserError(
        state,
        `str: Expected target to be a string, but got ${typeof target}`
      )
    }

    const slicedTarget = target.slice(index)

    if (slicedTarget.length === 0) {
      return updateParserError(
        state,
        `str: Tried to match '${s}', but got unexpected end of input`
      )
    }

    if (slicedTarget.startsWith(s)) {
      return updateParserState(state, index + s.length, s)
    }

    return updateParserError(
      state,
      `str: Tried to match '${s}', but got '${target.slice(
        index,
        index + target.length
      )}'`
    )
  })
