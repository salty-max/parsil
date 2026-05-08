import { Parser, ParserState, updateResult } from '@parsil/parser'

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
  <S, V, E>(sepParser: Parser<S, E>) =>
  (valueParser: Parser<V, E>): Parser<V[]> =>
    new Parser<V[]>((state) => {
      if (state.isError) return state

      const results: V[] = []
      let cursor: ParserState<S | V, E> = state

      while (true) {
        const valueState = valueParser.p(cursor)
        if (valueState.isError) break

        const sepState = sepParser.p(valueState)
        if (sepState.isError) {
          // Value matched but no terminator — fail the whole parser.
          return sepState
        }

        results.push(valueState.result)
        cursor = sepState
      }

      return updateResult(cursor, results)
    })
