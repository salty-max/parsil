import { Parser, updateResult } from "@parsil/parser";

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
 * @returns A function that takes a parser and returns a parser applying
 *   it `n` times and collecting the results in an array.
 */
export function exactly<T, N extends number>(n: N): (p: Parser<T>) => Parser<T[]> {
  if (typeof n !== "number" || n <= 0) {
    throw new TypeError(`exactly must be called with a number > 0, but got ${n}`);
  }

  return (parser: Parser<T>) =>
    new Parser((state) => {
      if (state.isError) return state;

      const results: T[] = [];
      let nextState = state;

      for (let i = 0; i < n; i++) {
        const out = parser.p(nextState);

        if (out.isError) {
          return out;
        } else {
          nextState = out;
          results.push(nextState.result);
        }
      }

      return updateResult(nextState, results);
    }).errorMap(({ index, error }) => `ParseError @ index ${index} -> exactly: Expected ${n}${error.replace(errorExpectRegex, "")}`);
}