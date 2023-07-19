import { Parser, updateError } from '../../parser'
import { sepBy } from './sep-by'

/**
 * Creates a parser that matches one or more values separated by a given separator.
 *
 * This parser is similar to `sepBy`, but requires at least one match of `valueParser`.
 *
 * @param sepParser - The parser that matches the separator between values.
 * @param valueParser - The parser that matches the values.
 * @returns A parser that results in an array of values matched by `valueParser`.
 * If no values are matched, the parser fails with an error.
 *
 * @template S - The type of the separator's result.
 * @template V - The type of the value's result.
 * @template E - The type of the error message, typically `string`.
 */
export const sepByOne =
  <S, V, E>(sepParser: Parser<S, E>) =>
  (valueParser: Parser<V, E>): Parser<Array<V>> =>
    new Parser((state) => {
      if (state.isError) return state

      const out = sepBy(sepParser)(valueParser).p(state)

      if (out.result.length === 0) {
        return updateError(
          state,
          `ParseError @ index ${state.index} -> sepByOne: Expected to match at least one separated value`
        )
      }

      return out
    })
