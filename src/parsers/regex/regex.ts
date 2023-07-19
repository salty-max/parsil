import { Parser, ParserState, updateError, updateState } from '../../parser'
import { encoder, getString } from '../../util'

export const regex = (re: RegExp): Parser<string> => {
  const typeofre = Object.prototype.toString.call(re)
  if (typeofre !== '[object RegExp]') {
    throw new TypeError(
      `regex must be called with a Regular Expression, but got ${typeofre}`
    )
  }

  if (re.toString()[1] !== '^') {
    throw new Error(`regex parsers must contain '^' start assertion`)
  }

  return new Parser<string>((state): ParserState<string, string> => {
    if (state.isError) return state
    const { dataView, index } = state
    const rest = getString(index, dataView.byteLength - index, dataView)

    if (rest.length >= 1) {
      const match = rest.match(re)
      return match
        ? updateState(
            state,
            index + encoder.encode(match[0]).byteLength,
            match[0]
          )
        : updateError(
            state,
            `ParseError (position ${index}) Tried to match '${re}', got '${rest.slice(
              0,
              5
            )}...'`
          )
    }

    return updateError(
      state,
      `ParseError (position ${index}) Tried to match ${re}, but got unexpected end of input`
    )
  })
}
