import { Parser, updateError } from '../../parser'
import { many } from './many'

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

    const out = many(parser).p(state)

    if (out.result.length) {
      return out
    }

    return updateError(
      state,
      `ParseError @ index ${state.index} -> manyOne: Expected to match at least one value`
    )
  })
}
