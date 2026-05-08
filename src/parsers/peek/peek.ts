import {
  forward,
  parseError,
  Parser,
  updateError,
  updateState,
} from '@parsil/parser/parser'

/**
 * `peek` peeks at the next byte in the input without consuming it. It
 * returns the value of the next byte as a number.
 *
 * @example
 * const data = new Uint8Array([1, 2, 3])
 * peek.run(new DataView(data.buffer))
 * // { isError: false, result: 1, index: 0 }
 *
 * @returns A parser that peeks at the next byte in the input.
 */
export const peek: Parser<number> = new Parser((state) => {
  if (state.isError) return forward(state)

  const { index, dataView } = state

  if (index < dataView.byteLength) {
    return updateState(state, index, dataView.getUint8(index))
  }

  return updateError(
    state,
    parseError('peek', index, 'Unexpected end of input')
  )
})
