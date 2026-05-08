import {
  forward,
  ParseError,
  parseError,
  Parser,
  updateError,
} from '@parsil/parser'
import { endBy } from '@parsil/parsers/sep-by/end-by'

/**
 * Like {@link endBy} but requires at least one terminated value.
 *
 * @example
 * endByOne(char(';'))(letters).run('a;b;')  // ['a', 'b']
 * endByOne(char(';'))(letters).run('')      // fails
 *
 * @param sepParser The separator parser (terminator).
 * @returns A function taking a value parser and returning the list parser.
 */
export const endByOne =
  <S, V>(sepParser: Parser<S>) =>
  (valueParser: Parser<V>): Parser<V[]> =>
    new Parser<V[]>((state) => {
      if (state.isError) return forward(state)

      const out = endBy<S, ParseError>(sepParser)<V>(valueParser).p(state)
      if (out.isError) return forward(out)

      if (out.result.length === 0) {
        return updateError(
          state,
          parseError(
            'endByOne',
            state.index,
            'Expected to match at least one terminated value'
          )
        )
      }
      return out
    })
