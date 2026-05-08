import { InputTypes } from '@parsil/input-types'
import {
  forward,
  ParseError,
  parseError,
  Parser,
  updateError,
  updateResult,
} from '@parsil/parser'

/**
 * `endOfInput` succeeds (yielding `null`) if the input has been fully
 * consumed; fails with the next byte's value otherwise.
 *
 * @example
 * sequenceOf([str('abc'), endOfInput]).run('abc')
 * // { isError: false, result: ['abc', null], index: 3 }
 *
 * @returns A parser that asserts the end of input.
 */
export const endOfInput = new Parser<null, ParseError>((state) => {
  if (state.isError) return forward(state)
  const { dataView, index, inputType } = state

  if (index !== dataView.byteLength) {
    const errorByte =
      inputType === InputTypes.STRING
        ? String.fromCharCode(dataView.getUint8(index))
        : `0x${dataView.getUint8(index).toString(16).padStart(2, '0')}`

    return updateError(
      state,
      parseError(
        'endOfInput',
        index,
        `Expected end of input, but got '${errorByte}'`,
        { actual: errorByte }
      )
    )
  }

  return updateResult(state, null)
})
