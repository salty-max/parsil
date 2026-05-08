import { Parser, ParserState, updateResult } from '@parsil/parser'

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
  <S, V, E>(sepParser: Parser<S, E>) =>
  (valueParser: Parser<V, E>): Parser<V[]> =>
    new Parser<V[]>((state) => {
      if (state.isError) return state

      const results: V[] = []
      let cursor: ParserState<S | V, E> = state

      while (true) {
        const valueState = valueParser.p(cursor)
        if (valueState.isError) break
        results.push(valueState.result)
        cursor = valueState

        const sepState = sepParser.p(cursor)
        if (sepState.isError) break
        cursor = sepState
        // Trailing-separator-allowed: loop continues; if next value
        // doesn't parse, we exit cleanly with whatever we collected.
      }

      return updateResult(cursor, results)
    })
