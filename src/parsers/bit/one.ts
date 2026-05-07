import {
  parseError,
  Parser,
  updateError,
  updateState,
} from '@parsil/parser/parser'
import { bit } from '@parsil/parsers/bit/bit'

/**
 * `one` matches the next bit only if it is 1.
 *
 * @returns A parser that reads the next bit and asserts it is 1.
 */
export const one: Parser<number> = new Parser((state) => {
  if (state.isError) return state

  const bitAtIndex = bit.p(state)

  if (bitAtIndex.result !== 1) {
    return updateError(
      state,
      parseError('one', state.index, 'Expected 1 but got 0', {
        expected: '1',
        actual: '0',
      })
    )
  }

  return updateState(state, state.index + 1, bitAtIndex.result)
})
