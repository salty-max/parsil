import {
  forward,
  parseError,
  Parser,
  ParserState,
  updateError,
  updateResult,
} from '@parsil/parser'

/**
 * `endBy(sep)(val)` matches zero or more `val`s where each value MUST
 * be followed by `sep`. Useful for declarations terminated by `;` or
 * lines terminated by `\n` where a trailing separator is **required**,
 * not optional.
 *
 * If a value parses but the following separator fails, the whole
 * parser fails (no soft-cut).
 *
 * @example
 * endBy(char(';'))(letters).run('a;b;c;')  // ['a', 'b', 'c']
 * endBy(char(';'))(letters).run('a;b;c')   // fails — last value lacks ';'
 * endBy(char(';'))(letters).run('')        // []
 *
 * @param sepParser The separator parser (terminator).
 * @returns A function taking a value parser and returning the list parser.
 */
export const endBy =
  <S, E>(sepParser: Parser<S, E>) =>
  <V>(valueParser: Parser<V, E>): Parser<V[], E> =>
    new Parser<V[], E>((state) => {
      if (state.isError) return forward(state)

      const results: V[] = []
      let cursor: ParserState<unknown, E> = state

      while (true) {
        const startIdx = cursor.index

        const valueState = valueParser.p(cursor)
        if (valueState.isError) break

        const sepState = sepParser.p(valueState)
        if (sepState.isError) {
          // Value matched but no terminator — fail the whole parser.
          return forward(sepState)
        }

        results.push(valueState.result)
        cursor = sepState

        // Infinite-loop guard: see sepBy for rationale.
        if (cursor.index === startIdx) {
          return updateError(
            state,
            // See sepBy for the cast rationale.
            parseError(
              'endBy',
              state.index,
              'value and terminator parsers both succeeded without consuming input — infinite loop guard. Ensure at least one of them advances on success.'
            ) as unknown as E
          )
        }
      }

      return updateResult(cursor, results)
    })
