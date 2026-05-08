import {
  forward,
  parseError,
  Parser,
  ParserState,
  updateError,
  updateResult,
} from '@parsil/parser'

/**
 * `sepEndBy(sep)(val)` matches zero or more `val`s separated by `sep`,
 * with an **optional trailing separator**. JSON-like and TOML-like
 * grammars commonly need this — `[1, 2, 3,]` is valid in many.
 *
 * @example
 * sepEndBy(char(','))(digits).run('1,2,3,')  // ['1', '2', '3']
 * sepEndBy(char(','))(digits).run('1,2,3')   // ['1', '2', '3']
 * sepEndBy(char(','))(digits).run('')        // []
 *
 * @param sepParser The separator parser.
 * @returns A function taking a value parser and returning the list parser.
 */
export const sepEndBy =
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
        results.push(valueState.result)
        cursor = valueState

        const sepState = sepParser.p(cursor)
        if (sepState.isError) break
        cursor = sepState
        // Trailing-separator-allowed: loop continues; if next value
        // doesn't parse, we exit cleanly with whatever we collected.

        // Infinite-loop guard: see sepBy for rationale.
        if (cursor.index === startIdx) {
          return updateError(
            state,
            // See sepBy for the cast rationale.
            parseError(
              'sepEndBy',
              state.index,
              'value and separator parsers both succeeded without consuming input — infinite loop guard. Ensure at least one of them advances on success.'
            ) as unknown as E
          )
        }
      }

      return updateResult(cursor, results)
    })
