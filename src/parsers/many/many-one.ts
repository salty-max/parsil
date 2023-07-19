import { Parser, updateError, updateResult } from '../../parser'

/**
 * Applies a parser one or more times until it fails, and returns an array of the results.
 * It fails and does not consume any input if the parser fails on the first try.
 *
 * @param parser The parser to apply to the input.
 * @returns A new Parser instance that applies the given parser as many times as possible, requiring at least one match.
 */
export const manyOne = function manyOne<T>(parser: Parser<T>): Parser<T[]> {
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

    if (results.length === 0) {
      return updateError(
        state,
        `ParseError (position: ${state.index}): Unable to match any input using parser`
      )
    }

    return updateResult(nextState, results)
  })
}
