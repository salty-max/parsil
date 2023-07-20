import { Parser, updateError, updateState } from '../../parser/parser'

export const peek: Parser<number> = new Parser((state) => {
  if (state.isError) return state

  const { index, dataView } = state

  if (index < dataView.byteLength) {
    return updateState(state, index, dataView.getUint8(index))
  }

  return updateError(
    state,
    `ParseError @ index ${index} -> peek: Unexpected end of input`
  )
})
