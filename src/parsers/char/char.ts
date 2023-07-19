import { Parser, ParserState, updateError, updateState } from '../../parser'
import { getCharacterLength, getNextCharWidth, getUtf8Char } from '../../util'

export const char = (c: string): Parser<string> => {
  if (!c || getCharacterLength(c) !== 1) {
    throw new TypeError(
      `char must be called with a single character, but got '${c}'`
    )
  }

  return new Parser<string>((state): ParserState<string, string> => {
    if (state.isError) return state

    const { index, dataView } = state
    if (index < dataView.byteLength) {
      const charWidth = getNextCharWidth(index, dataView)
      if (index + charWidth <= dataView.byteLength) {
        const char = getUtf8Char(index, charWidth, dataView)
        if (char === c) {
          return updateState(state, index + charWidth, c)
        }

        return updateError(
          state,
          `ParseError @ index 0 -> char: Expected '${c}', but got '${char}'`
        )
      }
    }

    return updateError(
      state,
      `ParseError @ index 0 -> char: Expected '${c}', but got unexpected end of input`
    )
  })
}
