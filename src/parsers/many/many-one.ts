import { Parser, updateError } from '../../parser'
import { many } from './many'

/**
 * `manyOne` is similar to `many`, but it requires the input parser to match the input at least once.
 * If the input parser doesn't match the input at all, `manyOne` fails with an error.
 * Otherwise, it applies the parser as many times as possible and collects the results into an array.
 *
 * @example
 * const parser = manyOne(str("abc"))
 * parser.run("abcabcabcxyz")  // returns ["abc", "abc", "abc"]
 * parser.run("xyzabcabcabc")  // returns "ParseError @ index 0 -> manyOne: Expected to match at least one value"
 *
 * @template T The type of result that the parser will produce.
 *
 * @param parser The parser to apply one or more times.
 * @returns {Parser<T[]>} A parser that applies `parser` one or more times.
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
