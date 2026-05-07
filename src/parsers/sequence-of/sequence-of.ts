import { Parser, updateResult } from '@parsil/parser/parser'

/**
 * `sequenceOf` is a parser combinator that accepts an array of parsers and applies them
 * in sequence to the input. If all parsers succeed, it returns an `Ok` result with an array
 * of their results and the next position in the input. If any parser fails, it fails immediately
 * and returns the error state of that parser.
 *
 * @example
 * const parser = sequenceOf([str("abc"), str("123")])
 * parser.run("abc123xyz")  // returns { isError: false, result: ["abc", "123"], index: 6 }
 * parser.run("xyzabc123")  // returns { isError: true, error: "ParseError @ index 0 -> str: Tried to match 'abc', but got 'xyz...'", index: 0 }
 *
 * @param parsers An array of parsers to apply in sequence.
 * @returns A parser that yields a tuple of each parser's result.
 */
export function sequenceOf<T extends Parser<unknown, unknown>[]>(
  parsers: T
): Parser<{ [K in keyof T]: T[K] extends Parser<infer R> ? R : never }> {
  type ResultTuple = { [K in keyof T]: T[K] extends Parser<infer R> ? R : never }
  return new Parser((state) => {
    if (state.isError) return state

    const results: unknown[] = []
    let nextState = state

    for (const p of parsers) {
      const out = p.p(nextState)

      if (out.isError) return out

      nextState = out
      results.push(out.result)
    }

    // TypeScript cannot derive `unknown[]` -> `{[K in keyof T]: ...}`
    // from the loop above; the cast is the contained acknowledgment.
    return updateResult(nextState, results as ResultTuple)
  })
}
