import {
  forward,
  parseError,
  Parser,
  ParserState,
  updateError,
  updateResult,
} from '@parsil/parser'

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
        const startIdx = nextState.index

        const valueState = valueParser.p(nextState)
        if (valueState.isError) break

        results.push(valueState.result)
        nextState = valueState

        const sepState = sepParser.p(valueState)
        if (sepState.isError) break
        nextState = sepState

        // Infinite-loop guard: if neither value nor separator advanced
        // the cursor across this whole iteration, the parsers loop
        // forever on the same position. Surface as a parse failure.
        if (nextState.index === startIdx) {
          return updateError(
            state,
            // The guard always emits a `ParseError`; if the consumer
            // pinned a custom `E`, this surfaces the loop as a
            // ParseError-shaped failure they can `errorMap` at the
            // boundary. Same pattern as `choice`'s composite failure.
            parseError(
              'sepBy',
              state.index,
              'value and separator parsers both succeeded without consuming input — infinite loop guard. Ensure at least one of them advances on success.'
            ) as unknown as E
          )
        }
      }

      return updateResult(nextState, results)
    })
