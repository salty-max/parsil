import { forward, ParseError, Parser, updateResult } from '@parsil/parser/parser'

/**
 * `sequenceOf` is a parser combinator that accepts an array of parsers and applies them
 * in sequence to the input. If all parsers succeed, it returns an `Ok` result with an array
 * of their results and the next position in the input. If any parser fails, it fails immediately
 * and returns the error state of that parser.
 *
 * All parsers in the sequence must share an error type `E` (defaulting
 * to `ParseError`). The resulting parser carries that same `E`.
 *
 * @example
 * const parser = sequenceOf([str("abc"), str("123")])
 * parser.run("abc123xyz")  // returns { isError: false, result: ["abc", "123"], index: 6 }
 * parser.run("xyzabc123")  // returns { isError: true, error: "...", index: 0 }
 *
 * @param parsers An array of parsers to apply in sequence.
 * @returns A parser that yields a tuple of each parser's result.
 */
export function sequenceOf<
  E = ParseError,
  T extends readonly Parser<unknown, E>[] = Parser<unknown, E>[],
>(
  parsers: T
): Parser<
  { [K in keyof T]: T[K] extends Parser<infer R, E> ? R : never },
  E
> {
  type ResultTuple = {
    [K in keyof T]: T[K] extends Parser<infer R, E> ? R : never
  }
  return new Parser<ResultTuple, E>((state) => {
    if (state.isError) return forward(state)

    const results: unknown[] = []
    let nextState: typeof state = state

    for (const p of parsers) {
      const out = p.p(nextState)

      if (out.isError) return forward(out)

      nextState = out
      results.push(out.result)
    }

    // TypeScript cannot derive `unknown[]` -> `{[K in keyof T]: ...}`
    // from the loop above; the cast is the contained acknowledgment.
    return updateResult(nextState, results as ResultTuple)
  })
}
