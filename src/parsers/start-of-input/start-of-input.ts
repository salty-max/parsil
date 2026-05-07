import { ParseError, parseError, Parser, updateError } from '@parsil/parser'

/**
 * `startOfInput` succeeds (yielding `null`) if the cursor is at byte 0
 * and fails otherwise.
 *
 * @example
 * sequenceOf([startOfInput, str('abc')]).run('abc')
 * // { isError: false, result: [null, 'abc'], index: 3 }
 *
 * @returns A parser that asserts the start of input.
 */
export const startOfInput = new Parser<null, ParseError>((state) => {
  if (state.isError) return state
  const { index } = state
  if (index > 0) {
    return updateError(
      state,
      parseError('startOfInput', index, 'Expected start of input')
    )
  }

  return state
})
