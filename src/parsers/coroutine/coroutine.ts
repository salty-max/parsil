import { Parser, ParserState, updateResult } from '../../parser/parser'

/**
 * A function that represents the shape of a parser function.
 * @template T The type of the parser result.
 */
type ParserFn<T> = (_yield: <K>(parser: Parser<K>) => K) => T

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
export const coroutine = <T>(parserFn: ParserFn<T>): Parser<T> => {
  return new Parser((state) => {
    let currentValue
    let currentState = state

    const run = <T>(parser: Parser<T>) => {
      if (!(parser && parser instanceof Parser)) {
        throw new Error(
          `coroutine passed values must be parsers, got ${parser}`
        )
      }

      const newState = parser.p(currentState)
      if (newState.isError) {
        throw newState
      } else {
        currentState = newState
      }

      currentValue = currentState.result
      return currentValue
    }

    try {
      const result = parserFn(run)
      return updateResult(currentState, result)
    } catch (e) {
      if (e instanceof Error) {
        throw e
      } else {
        return e as ParserState<any, any>
      }
    }
  })
}
