import { Parser, updateError, updateState } from '../../parser/parser'

/**
 * `bit` reads the next bit from the input.
 * It returns the parsed bit as a number.
 *
 * @example
 * const parser = bit;
 * const data = new Uint8Array([42]).buffer
 * parser.run(new Dataview(data))  // returns the next bit from the bitset
 *
 * @returns {Parser<number>} A parser that reads the next bit from the input.
 */
export const bit: Parser<number> = new Parser((state) => {
  if (state.isError) return state

  const byteOffset = Math.floor(state.index / 8)

  if (byteOffset >= state.dataView.byteLength) {
    updateError(
      state,
      `ParseError @ index ${state.index} -> bit: Unexpected end of input`
    )
  }

  const byte = state.dataView.getUint8(byteOffset)
  const bitOffset = 7 - (state.index % 8)
  const bit = (byte & (1 << bitOffset)) >> bitOffset

  return updateState(state, state.index + 1, bit)
})
