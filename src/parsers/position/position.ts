import { Parser, ParserState, updateState } from '@parsil/parser/parser'

/**
 * `index` produces the current byte offset in the input without consuming any input.
 * Useful for attaching source spans to parsed nodes.
 */
export const index: Parser<number, never> = new Parser(
  (state): ParserState<number, never> =>
    updateState(state, state.index, state.index) as ParserState<number, never>
)
