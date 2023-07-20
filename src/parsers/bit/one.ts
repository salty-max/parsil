import { Parser, updateError, updateState } from '../../parser/parser'
import { bit } from './bit'

/**
 * `one` is similar to `bit` but expect the parsed bit to be 1.
 *
 * @example
 * const parser = one;
 * const data = new Uint8Array([42]).buffer
 * parser.run(new Dataview(data))  // returns the next bit from the bitset if 1, else returns an error
 *
 * @returns {Parser<number>} A parser that reads the next bit (1) from the input.
 */
export const one: Parser<number> = new Parser((state) => {
  if (state.isError) return state

  const bitAtIndex = bit.p(state)

  if (bitAtIndex.result !== 1) {
    return updateError(
      state,
      `ParseError @ index ${state.index} -> one: Expected 1 but got 0`
    )
  }

  return updateState(state, state.index + 1, bitAtIndex.result)
})
