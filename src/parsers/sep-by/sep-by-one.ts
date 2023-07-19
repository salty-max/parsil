import { Parser, updateError } from '../../parser'
import { sepBy } from './sep-by'

/**
 * `sepByOne` is a parser combinator that accepts two parsers as arguments: `sepParser` and `valueParser`.
 * It applies the `valueParser` and `sepParser` in sequence and repeats this process until `valueParser` fails.
 * If at least one value is matched, it returns an `Ok` result with an array of matched values.
 * If no values are matched, it fails and returns an `Err` with an error message indicating that it expected to match at least one separated value.
 *
 * @example
 * const parser = sepByOne(str(", "))(letters)
 * parser.run("a, b, c")  // returns { isError: false, result: ["a", "b", "c"], index: 8 }
 * parser.run("123")  // returns { isError: true, error: "ParseError @ index 0 -> sepByOne: Expected to match at least one separated value", index: 0 }
 *
 * @param sepParser The parser that recognizes the separator.
 * @param valueParser The parser that recognizes the values to be separated.
 * @returns {Parser<Array<V>>} A parser that applies `sepParser` and `valueParser` in sequence until `valueParser` fails and returns an array of matched values.
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
