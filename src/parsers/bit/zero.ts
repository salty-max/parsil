import { Parser, updateError, updateState } from '../../parser/parser'
import { bit } from './bit'

/**
 * `zero` is similar to `bit` but expect the parsed bit to be 0.
 *
 * @example
 * const parser = zero;
 * const data = new Uint8Array([42]).buffer
 * parser.run(new Dataview(data))  // returns the next bit from the bitset if 0, else returns an error
 *
 * @returns {Parser<number>} A parser that reads the next bit (0) from the input.
 */
export const zero: Parser<number> = new Parser((state) => {
  if (state.isError) return state

  const bitAtIndex = bit.p(state)

  if (bitAtIndex.result !== 0) {
    return updateError(
      state,
      `ParseError @ index ${state.index} -> zero: Expected 0 but got 1`
    )
  }

  return updateState(state, state.index + 1, bitAtIndex.result)
})
