import { Parser, updateError, updateState } from '../../parser/parser'

/**
 * `peek` peeks (u don't say) at the next byte in the input, without consuming it.
 * It returns the value of the next byte as a number.
 *
 * @example
 * const parser = P.peek;
 * const data = new Uint8Array([1, 2, 3]);
 * parser.run(new DataView(data.buffer)); // returns { isError: false, result: 1, index: 0 }
 *
 * @returns {Parser<number>} A parser that peeks at the next byte in the input.
 */
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
