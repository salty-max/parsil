import {
  forward,
  parseError,
  Parser,
  updateError,
  updateResult,
} from '@parsil/parser'

/**
 * Match `p` between `min` and `max` times (both inclusive). Fails if
 * fewer than `min` matches are available; stops after `max`.
 *
 * @example
 * repeatBetween(2, 4)(digit).run('1234567')  // ['1', '2', '3', '4']
 * repeatBetween(2, 4)(digit).run('1')        // fails
 *
 * @param min Minimum required matches.
 * @param max Maximum allowed matches.
 * @returns A function taking a parser and returning the list parser.
 */
export const repeatBetween =
  <T>(min: number, max: number) =>
  (p: Parser<T>): Parser<T[]> => {
    if (typeof min !== 'number' || min < 0) {
      throw new TypeError(
        `repeatBetween min must be a non-negative number, but got ${min}`
      )
    }
    if (typeof max !== 'number' || max < min) {
      throw new TypeError(
        `repeatBetween max must be a number >= min (${min}), but got ${max}`
      )
    }
    return new Parser<T[]>((state) => {
      if (state.isError) return forward(state)

      const results: T[] = []
      let cursor = state

      for (let i = 0; i < max; i++) {
        const out = p.p(cursor)
        if (out.isError) break
        results.push(out.result)
        cursor = out
      }

      if (results.length < min) {
        return updateError(
          state,
          parseError(
            'repeatBetween',
            state.index,
            `Expected at least ${min} matches, but got ${results.length}`,
            { expected: `${min}-${max} matches` }
          )
        )
      }

      return updateResult(cursor, results)
    })
  }
