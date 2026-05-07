import {
  parseError,
  Parser,
  updateError,
  updateState,
} from '@parsil/parser/parser'
import { bit } from '@parsil/parsers/bit/bit'

/**
 * `zero` matches the next bit only if it is 0.
 *
 * @returns A parser that reads the next bit and asserts it is 0.
 */
export const zero: Parser<number> = new Parser((state) => {
  if (state.isError) return state

  const bitAtIndex = bit.p(state)

  if (bitAtIndex.result !== 0) {
    return updateError(
      state,
      parseError('zero', state.index, 'Expected 0 but got 1', {
        expected: '0',
        actual: '1',
      })
    )
  }

  return updateState(state, state.index + 1, bitAtIndex.result)
})
