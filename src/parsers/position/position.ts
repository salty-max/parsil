import { Parser, ParserState, updateState } from '../../parser/parser'

/**
 * `index` produces the current byte offset in the input without consuming any input.
 * Useful for attaching source spans to parsed nodes.
 */
export const index: Parser<number, never> = new Parser(
  (state): ParserState<number, never> =>
    updateState(state as any, state.index, state.index)
)
