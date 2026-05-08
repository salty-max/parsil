import { parseError, Parser, updateError } from '@parsil/parser'
import { many } from '@parsil/parsers/many/many'

/**
 * Match `p` at least `n` times. Fails if fewer matches are available.
 * No upper bound — collects as many as the input contains.
 *
 * @example
 * atLeast(2)(digit).run('1234x')  // ['1', '2', '3', '4']
 * atLeast(3)(digit).run('12')     // fails
 *
 * @param n Minimum required matches.
 * @returns A function taking a parser and returning the list parser.
 */
export const atLeast =
  <T>(n: number) =>
  (p: Parser<T>): Parser<T[]> => {
    if (typeof n !== 'number' || n < 0) {
      throw new TypeError(
        `atLeast must be called with a non-negative number, but got ${n}`
      )
    }
    return new Parser<T[]>((state) => {
      if (state.isError) return state
      const out = many(p).p(state)
      if (out.result.length < n) {
        return updateError(
          state,
          parseError(
            'atLeast',
            state.index,
            `Expected at least ${n} matches, but got ${out.result.length}`,
            { expected: `at least ${n}` }
          )
        )
      }
      return out
    })
  }
