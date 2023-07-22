import { InputTypes } from '../../input-types'
import { Parser, updateError, updateResult } from '../../parser/'

/**
 * `endOfInput` checks if the input stream has been fully consumed.
 * If the input stream has been consumed, it returns a successful parser state with a `null` result.
 * If there are still unparsed bytes in the input, it returns a failed parser state with an error message.
 *
 * @example
 * const parser = sequenceOf(str("abc"), endOfInput);
 * parser.run("abc");  // returns null
 * parser.run("abcxyz");  // returns `ParseError @ index 3 -> endOfInput: Expected end of input, but got 'x'`
 *
 * @returns {Parser<null, string>} A parser that asserts the end of the input stream.
 */
export const endOfInput = new Parser<null, string>((state) => {
  if (state.isError) return state
  const { dataView, index, inputType } = state

  if (index !== dataView.byteLength) {
    const errorByte =
      inputType === InputTypes.STRING
        ? String.fromCharCode(dataView.getUint8(index))
        : `0x${dataView.getUint8(index).toString(16).padStart(2, '0')}`

    return updateError(
      state,
      `ParseError @ index ${index} -> endOfInput: Expected end of input, but got '${errorByte}'`
    )
  }

  return updateResult(state, null)
})
