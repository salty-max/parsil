import { forward, parseError, Parser, updateError } from '@parsil/parser'
import { many } from '@parsil/parsers/many/many'

/**
 * `manyOne` is like `many` but requires `parser` to match at least
 * once. Fails if zero matches.
 *
 * @example
 * manyOne(str('abc')).run('abcabcxyz') // ['abc', 'abc']
 * manyOne(str('abc')).run('xyz')       // fails
 *
 * @param parser The parser to apply one or more times.
 * @returns A parser that applies `parser` one or more times.
 */
export const manyOne = function manyOne<T>(parser: Parser<T>): Parser<T[]> {
  return new Parser((state) => {
    if (state.isError) return forward(state)

    const out = many(parser).p(state)

    if (out.result.length) {
      return out
    }

    return updateError(
      state,
      parseError('manyOne', state.index, 'Expected to match at least one value')
    )
  })
}
