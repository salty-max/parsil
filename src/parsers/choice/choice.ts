import {
  forward,
  ParseError,
  parseError,
  Parser,
  ParserState,
  updateError,
} from '@parsil/parser'

/**
 * `choice` is a parser combinator that tries each parser in a given list of parsers, in order,
 * until one succeeds. If a parser succeeds, it consumes the relevant input and returns the result.
 * If no parser succeeds, `choice` fails with an error message.
 * An error is also thrown if `choice` is called without a list or with an empty list.
 *
 * @example
 * const parser = choice([str("abc"), str("123")])
 * parser.run("abc123")  // returns "abc"
 * parser.run("123abc")  // returns "123"
 * parser.run("xyz")  // returns "ParseError @ index 0 -> choice: Unable to match with any parser"
 * choice([])  // throws `choice requires a non-empty list of parsers`
 *
 * @param parsers The list of parsers to try in order.
 * @throws {Error} If `parsers` is an empty list.
 * @returns A parser that applies the first successful parser in `parsers`.
 */
export function choice<
  E = ParseError,
  T extends readonly Parser<unknown, E>[] = Parser<unknown, E>[],
>(
  parsers: T
): Parser<T[number] extends Parser<infer R, E> ? R : never, E> {
  type Result = T[number] extends Parser<infer R, E> ? R : never

  if (parsers.length === 0) {
    throw new Error('choice requires a non-empty list of parsers')
  }

  if (parsers.length === 1) {
    return parsers[0] as unknown as Parser<Result, E>
  }

  return new Parser<Result, E>((state) => {
    if (state.isError) return forward(state)

    // Track two pieces of information across failing branches:
    // 1. expected[]   — what each branch was looking for, joined into
    //    a 'Expected one of: a | b | c' message and exposed as
    //    `error.expected` on the composite failure.
    // 2. furthestError — the failing branch that consumed the most
    //    input. Heuristically that branch matched the user's intent
    //    further than the others; surfacing it in `error.message` is
    //    more useful than a generic 'Unable to match'.
    const expectedFromBranches: string[] = []
    let furthestError: ParseError | undefined

    for (const p of parsers) {
      const out = p.p(state)
      if (!out.isError) {
        return out as ParserState<Result, E>
      }
      const e = out.error as ParseError | undefined
      if (e && typeof e === 'object') {
        if ('expected' in e && e.expected) {
          expectedFromBranches.push(e.expected)
        } else if ('parser' in e && e.parser) {
          expectedFromBranches.push(e.parser)
        }
        if (
          'index' in e &&
          typeof e.index === 'number' &&
          (!furthestError || e.index > furthestError.index)
        ) {
          furthestError = e
        }
      }
    }

    const expected = expectedFromBranches.length
      ? expectedFromBranches.join(' | ')
      : undefined

    // Surface the deepest branch error in the message when available;
    // otherwise fall back to the generic "Unable to match".
    const baseMessage = expected
      ? `Expected one of: ${expected}`
      : 'Unable to match with any parser'
    const message = furthestError
      ? `${baseMessage}; furthest branch failed at index ${furthestError.index}: ${furthestError.message}`
      : baseMessage

    // The composite failure is a `ParseError` regardless of `E`. The
    // common case is `E = ParseError` and this is a no-op; if a consumer
    // pinned a custom `E`, choice's own failure surfaces in `ParseError`
    // shape — they can `errorMap` it back at the boundary.
    return updateError(
      state,
      parseError(
        'choice',
        // Anchor the choice failure at the position where it started,
        // not the furthest branch's index — the user can still read
        // furthestError.index from the message body if they want it.
        state.index,
        message,
        expected ? { expected } : {}
      ) as unknown as E
    )
  })
}
