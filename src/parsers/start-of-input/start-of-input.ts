import { Parser, updateError } from '../../parser'

/**
 * `startOfInput` is a parser that expects the parser to be at the start of the input.
 * If the parser is not at the start of the input, it fails with a `ParseError`.
 *
 * @example
 * const parser = sequenceOf(startOfInput, str("abc"))
 * parser.run("abc")  { isError: false, result: [null, "abc"], index: 3 }
 * parser.run("xyzabc")  { isError: true, index: 0,  error: `ParseError @ index 0 -> startOfInput: Expected start of input` }
 *
 * @returns {Parser<null, string>} A parser that expects the start of input.
 */
export const startOfInput = new Parser<null, string>((state) => {
  if (state.isError) return state
  const { index } = state
  if (index > 0) {
    return updateError(
      state,
      `ParseError @ index ${index} -> startOfInput: Expected start of input`
    )
  }

  return state
})
