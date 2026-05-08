import { forward, Parser, ParserState, updateResult } from '@parsil/parser'

/**
 * `sepBy` is a parser that matches zero or more occurrences of a value, separated by a given separator.
 * It returns an array of values that were separated by the separator.
 * If the separator does not occur in the input, the parser returns an empty array.
 *
 * @template S Type of the separator
 * @template V Type of the value
 * @template E Type of the potential error produced by the parsers
 *
 * @param sepParser The parser for the separator
 * @returns Function taking a value parser and returning a new parser
 *
 * @example
 * const commaSeparatedNumbers = sepBy(char(','))(manyOne(digits));
 * const result = commaSeparatedNumbers.run("1,2,3,4");
 * // result is { isError: false, result: ['1','2','3','4'], ... }
 */
export const sepBy =
  <S, E>(sepParser: Parser<S, E>) =>
  <V>(valueParser: Parser<V, E>): Parser<Array<V>, E> =>
    new Parser<Array<V>, E>((state) => {
      if (state.isError) return forward(state)

      const results: Array<V> = []
      let nextState: ParserState<unknown, E> = state

      while (true) {
        const valueState = valueParser.p(nextState)

        if (valueState.isError) {
          break
        }

        results.push(valueState.result)
        nextState = valueState

        const sepState = sepParser.p(valueState)
        if (sepState.isError) {
          break
        }

        nextState = sepState
      }

      return updateResult(nextState, results)
    })
