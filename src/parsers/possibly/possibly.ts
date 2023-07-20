import { Parser, updateResult } from '../../parser'

/**
 * `possibly` is a parser combinator that applies a given parser and returns its result,
 * or `null` if the parser fails.
 *
 * @example
 * const parser = possibly(P.letters);
 * parser.run('abc'); // returns { isError: false, result: 'abc', index: 3 }
 * parser.run('123'); // returns { isError: false, result: null, index: 0 }
 *
 * @template T The type of the result produced by the parser.
 * @template E The type of the error produced by the parser.
 * @param parser The parser to apply.
 * @returns {Parser<T | null, E>} A parser that returns the result of the applied parser, or `null` if it fails.
 */
export const possibly = <T, E>(parser: Parser<T, E>): Parser<T | null, E> => {
  return new Parser((state) => {
    if (state.isError) return state

    const nextState = parser.p(state)
    return nextState.isError ? updateResult(state, null) : nextState
  })
}
