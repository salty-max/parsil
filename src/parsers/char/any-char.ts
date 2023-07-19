import { Parser, ParserState, updateError, updateState } from '../../parser'
import { getNextCharWidth, getUtf8Char } from '../../util'

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
      `ParseError (position: ${index}): Expected a character, but got unexpected end of input`
    )
  }
)
