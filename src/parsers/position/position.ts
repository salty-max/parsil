import { ParseError, Parser, updateState } from '@parsil/parser/parser'

/**
 * `index` produces the current byte offset in the input without
 * consuming any input. Useful for attaching source spans to parsed
 * nodes.
 *
 * The error type is the project default `ParseError`. `index` cannot
 * actually fail in normal operation, but typing it `Parser<number,
 * never>` would prevent it from composing (via `then` / `chain`) with
 * any other parser whose `E` is `ParseError` — `never` does not widen
 * to `ParseError` in the contravariant input position of
 * `StateTransformerFn`.
 */
export const index: Parser<number, ParseError> = new Parser((state) =>
  updateState(state, state.index, state.index)
)
