import { Parser, updateError } from '../../parser/parser'

/**
 * `fail` is a parser that always fails with a given error message `error`. It does not consume any input.
 * This can be useful for explicitly handling error cases in your parsing logic.
 *
 * @example
 * const parser = fail("Always fails")
 * parser.run("anything")  // returns "Always fails"
 *
 * @param error The error message that this parser will always fail with.
 * @returns {Parser<any, E>} A parser that always fails with the error message `error`.
 */
export function fail<E>(error: E) {
  return new Parser<any, E>((state) => {
    if (state.isError) return state
    return updateError(state, error)
  })
}
