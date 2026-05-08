import {
  forward,
  ParseError,
  parseError,
  Parser,
  updateError,
} from '@parsil/parser'
import { sepEndBy } from '@parsil/parsers/sep-by/sep-end-by'

/**
 * Like {@link sepEndBy} but requires at least one value. Fails if zero
 * matches.
 *
 * @example
 * sepEndByOne(char(','))(digits).run('1,2,')  // ['1', '2']
 * sepEndByOne(char(','))(digits).run('')      // fails
 *
 * @param sepParser The separator parser.
 * @returns A function taking a value parser and returning the list parser.
 */
export const sepEndByOne =
  <S, V>(sepParser: Parser<S>) =>
  (valueParser: Parser<V>): Parser<V[]> =>
    new Parser<V[]>((state) => {
      if (state.isError) return forward(state)

      const out = sepEndBy<S, ParseError>(sepParser)<V>(valueParser).p(state)
      if (out.isError) return forward(out)

      if (out.result.length === 0) {
        return updateError(
          state,
          parseError(
            'sepEndByOne',
            state.index,
            'Expected to match at least one value'
          )
        )
      }
      return out
    })
