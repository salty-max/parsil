import {
  forward,
  Parser,
  updateError,
  updateResult,
} from '@parsil/parser/parser'

/**
 * `lookAhead` runs the given parser without consuming the input.
 *
 * @example
 * const parser = sequenceOf([str("hello "), lookAhead(str("world")), str("world")])
 * parser.run("hello world")  { isError: false, result: ["hello ", "world", "world"], index: 11 }
 *
 * @param parser The parser to apply at the current position.
 * @returns A parser that yields `parser`'s result without advancing the
 *   input cursor; if `parser` fails, the error is forwarded.
 */
export const lookAhead = <T, E>(parser: Parser<T, E>): Parser<T, E> =>
  new Parser((state) => {
    if (state.isError) return forward(state)

    const nextState = parser.p(state)
    return nextState.isError
      ? updateError(state, nextState.error)
      : updateResult(state, nextState.result)
  })
