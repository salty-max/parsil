import { forward, Parser, updateResult } from '@parsil/parser'

/**
 * Match `p` at most `n` times. Always succeeds (with `[]` if zero
 * matches up to `n`). Stops consuming after the n-th match even if
 * more would parse.
 *
 * @example
 * atMost(3)(digit).run('12345')  // ['1', '2', '3'], cursor at index 3
 * atMost(3)(digit).run('xy')     // [], cursor unchanged
 *
 * @param n Maximum allowed matches (inclusive).
 * @returns A function taking a parser and returning the list parser.
 */
export const atMost =
  (n: number) =>
  <T>(p: Parser<T>): Parser<T[]> => {
    if (typeof n !== 'number' || n < 0) {
      throw new TypeError(
        `atMost must be called with a non-negative number, but got ${n}`
      )
    }
    return new Parser<T[]>((state) => {
      if (state.isError) return forward(state)

      const results: T[] = []
      let cursor = state

      for (let i = 0; i < n; i++) {
        const out = p.p(cursor)
        if (out.isError) break
        results.push(out.result)
        cursor = out
      }

      return updateResult(cursor, results)
    })
  }
