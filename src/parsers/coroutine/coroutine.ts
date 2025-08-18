import { Parser, ParserState, updateResult } from '../../parser/parser'

/**
 * A function that represents the shape of a parser function.
 * @template T The type of the parser result.
 */
type ParserFn<T, E = string> = (_yield: <K>(parser: Parser<K, E>) => K) => T

/**
 * `coroutine` is a parser that allows for advanced control flow and composition of parsers.
 *
 * @example
 * const parserFn: ParserFn<number> = (yield) => {
 *   const x = yield(parserA);
 *   const y = yield(parserB);
 *   return x + y;
 * };
 *
 * const coroutineParser = coroutine(parserFn);
 * coroutineParser.run(input);
 *
 * @template T The type of the parser result.
 * @param {ParserFn<T>} parserFn The parser function that defines the coroutine logic.
 * @returns {Parser<T>} A coroutine parser.
 */
export const coroutine = <T, E = string>(
  parserFn: ParserFn<T, E>
): Parser<T, E> => {
  return new Parser<T, E>((state) => {
    let currentValue: unknown
    let currentState = state

    const run = <K>(parser: Parser<K, E>): K => {
      if (!(parser && parser instanceof Parser)) {
        throw new Error(
          `coroutine passed values must be parsers, got ${parser}`
        )
      }

      const nextState = parser.p(currentState)
      if (nextState.isError) {
        throw nextState
      }

      currentState = nextState as ParserState<unknown, E>
      currentValue = (currentState as ParserState<unknown, E>).result

      return currentValue as K
    }

    try {
      const result = parserFn(run)
      return updateResult(currentState, result) as ParserState<T, E>
    } catch (e) {
      if (e instanceof Error) {
        throw e
      } else {
        return e as ParserState<T, E>
      }
    }
  })
}
