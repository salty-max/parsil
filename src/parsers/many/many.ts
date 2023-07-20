import { Parser, updateResult } from '../../parser'

/**
 * `many` is a parser combinator that applies a given parser zero or more times.
 * It collects the results of each successful parse into an array, and stops
 * when the parser can no longer match the input.
 * It doesn't fail when the parser doesn't match the input at all; instead, it returns an empty array.
 *
 * @example
 * const parser = many(str("abc"))
 * parser.run("abcabcabcxyz")  // returns ["abc", "abc", "abc"]
 * parser.run("xyzabcabcabc")  // returns []
 *
 * @template T The type of result that the parser will produce.
 *
 * @param parser The parser to apply zero or more times.
 * @returns {Parser<T[]>} A parser that applies `parser` zero or more times.
 */
export const many = function many<T>(parser: Parser<T>): Parser<T[]> {
  return new Parser((state) => {
    if (state.isError) return state

    const results: Array<T> = []
    let done = false
    let nextState = state

    while (!done) {
      const out = parser.p(nextState)

      if (!out.isError) {
        nextState = out
        results.push(nextState.result)

        if (nextState.index >= nextState.dataView.byteLength) {
          done = true
        }
      } else {
        done = true
      }
    }

    return updateResult(nextState, results)
  })
}
