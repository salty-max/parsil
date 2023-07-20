import { Parser, updateResult } from "../../parser";

const errorExpectRegex = /ParseError @ index (\d+) ->.+Expected/

/**
 * `exactly` is a parser combinator that applies a given parser exactly `n` times.
 * It collects the results of each successful parse into an array.
 * If `n` is 1, it returns a parser that produces a single-element array.
 *
 * @example
 * const parser = P.exactly(3)(P.letter);
 * parser.run('abc'); // returns { isError: false, result: ['a', 'b', 'c'], index: 3 }
 *
 * @template T The type of result that the parser will produce.
 * @param n The number of times the parser should be applied.
 * @param parser The parser to apply `n` times.
 * @returns {Parser<T[]>} A parser that applies the given parser `n` times and collects the results in an array.
 */
export function exactly<T, N extends 1>(n: N): (p: Parser<T>) => Parser<[T]>;
export function exactly<T, N extends 2>(n: N): (p: Parser<T>) => Parser<[T, T]>;
export function exactly<T, N extends 3>(n: N): (p: Parser<T>) => Parser<[T, T, T]>;
export function exactly<T, N extends 4>(n: N): (p: Parser<T>) => Parser<[T, T, T, T]>;
export function exactly<T, N extends 5>(n: N): (p: Parser<T>) => Parser<[T, T, T, T, T]>;
export function exactly<T, N extends 6>(n: N): (p: Parser<T>) => Parser<[T, T, T, T, T, T]>;
export function exactly<T, N extends 7>(n: N): (p: Parser<T>) => Parser<[T, T, T, T, T, T, T]>;
export function exactly<T, N extends 8>(n: N): (p: Parser<T>) => Parser<[T, T, T, T, T, T, T, T]>;
export function exactly<T, N extends 9>(n: N): (p: Parser<T>) => Parser<[T, T, T, T, T, T, T, T, T]>;
export function exactly<T, N extends 10>(n: N): (p: Parser<T>) => Parser<[T, T, T, T, T, T, T, T, T, T]>;
export function exactly<T, N extends 11>(n: N): (p: Parser<T>) => Parser<[T, T, T, T, T, T, T, T, T, T, T]>;
export function exactly<T, N extends 12>(n: N): (p: Parser<T>) => Parser<[T, T, T, T, T, T, T, T, T, T, T, T]>;
export function exactly<T, N extends 13>(n: N): (p: Parser<T>) => Parser<[T, T, T, T, T, T, T, T, T, T, T, T, T]>;
export function exactly<T, N extends 14>(n: N): (p: Parser<T>) => Parser<[T, T, T, T, T, T, T, T, T, T, T, T, T, T]>;
export function exactly<T, N extends 15>(n: N): (p: Parser<T>) => Parser<[T, T, T, T, T, T, T, T, T, T, T, T, T, T, T]>;
export function exactly<T>(n: number): (p: Parser<T>) => Parser<T[]>;
export function exactly<T>(n: number): (p: Parser<T>) => Parser<T[]> {
  if (typeof n !== "number" || n <= 0) {
    throw new TypeError(`exactly must be called with a number > 0, but got ${n}`)
  }

  return (parser: Parser<T>) => new Parser(state => {
    if (state.isError) return state

    const results: T[] = []
    let nextState = state

    for (let i = 0; i < n; i++) {
      const out = parser.p(nextState)

      if (out.isError) {
        return out
      } else {
        nextState = out
        results.push(nextState.result)
      }
    }

    return updateResult(nextState, results)
  }).errorMap(({ index, error }) => `ParseError @ index ${index} -> exactly: Expected ${n}${error.replace(errorExpectRegex, '')}`)
}