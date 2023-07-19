import {
  Parser,
  ParserState,
  updateParserError,
  updateParserState,
} from '../parser'

export const str = (s: string): Parser =>
  new Parser((state: ParserState): ParserState => {
    const { targetString, index, isError } = state

    if (isError) return state

    const slicedTarget = targetString.slice(index)

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
      `str: Tried to match '${s}', but got '${targetString.slice(
        index,
        index + targetString.length
      )}'`
    )
  })
