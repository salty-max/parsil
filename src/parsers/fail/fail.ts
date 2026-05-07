import { Parser, ParserState, updateError } from '@parsil/parser/parser'

/**
 * `fail` is a parser that always fails with a given error message `error`. It does not consume any input.
 * This can be useful for explicitly handling error cases in your parsing logic.
 *
 * @example
 * const parser = fail("Always fails")
 * parser.run("anything")  // returns "Always fails"
 *
 * @param error The error message that this parser will always fail with.
 * @returns A parser that always fails with the error message `error`.
 */
export function fail<E>(error: E) {
  // `Parser<never, E>` correctly states that fail never produces a
  // result. The casts coerce the result-type slot from `any` to `never`
  // — sound because the state always carries `isError: true`, so
  // `result` is conventionally never read.
  return new Parser<never, E>((state): ParserState<never, E> => {
    if (state.isError) return state as ParserState<never, E>
    return updateError(state, error) as ParserState<never, E>
  })
}
