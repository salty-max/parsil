import { Parser, updateResult } from '../../parser/parser'

/**
 * `succeed` is a parser combinator that always succeeds and produces a constant value.
 * It ignores the input state and returns the specified value as the result.
 * @example
 * const parser = succeed(42);
 * parser.run("hello world"); // returns { isError: false, result: 42, index: 0 }
 * @template T The type of the value produced by the parser.
 * @param value The value to be produced by the parser.
 * @returns {Parser<T>} A parser that always succeeds and produces the specified value.
 */
export function succeed<T>(value: T) {
  return new Parser<T>((state) => {
    return updateResult(state, value)
  })
}
