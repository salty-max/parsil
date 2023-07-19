import { Parser, updateResult } from '../../parser'

/**
 * Applies a parser zero or more times until it fails, and returns an array of the results.
 * It does not consume any input if the parser fails on the first try.
 *
 * @param parser The parser to apply to the input.
 * @returns A new Parser instance that applies the given parser as many times as possible.
 */
export const many = function many<T>(parser: Parser<T>): Parser<T[]> {
  return new Parser((state) => {
    if (state.isError) return state

    const results = []
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
