import { Parser, updateError, updateResult } from '../../parser/parser'

/**
 * `lookAhead` runs the given parser without consuming the input.
 *
 * @example
 * const parser = sequenceOf([str("hello "), lookAhead(str("world")), str("world")])
 * parser.run("hello world")  { isError: false, result: ["hello ", "world", "world"], index: 11 }
 *
 * @param parser
 * @returns
 */
export const lookAhead = <T, E>(parser: Parser<T, E>): Parser<T, E> =>
  new Parser((state) => {
    if (state.isError) return state

    const nextState = parser.p(state)
    return nextState.isError
      ? updateError(state, nextState.error)
      : updateResult(state, nextState.result)
  })
