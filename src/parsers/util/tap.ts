import { Parser, ParserState } from '@parsil/parser'

/**
 * Run a side-effect on every successful parse without modifying the
 * result. Pure observation — handy for tracing, logging, or wiring a
 * parser into a metric.
 *
 * `fn` is called **once** per successful parse and **never** on
 * failure (the failing branch passes through untouched). The returned
 * parser keeps the original error type so it composes transparently.
 *
 * @example
 * const traced = tap<number>((value, { index }) =>
 *   console.log('got', value, 'at', index)
 * )(intLit)
 *
 * @param fn Callback invoked with the parsed `value` and the post-parse `state`.
 * @returns A function taking a parser and returning the wrapped parser.
 */
export const tap =
  <T>(fn: (value: T, state: ParserState<T, unknown>) => void) =>
  <E>(p: Parser<T, E>): Parser<T, E> =>
    new Parser((state) => {
      const next = p.p(state)
      if (!next.isError) {
        fn(next.result, next)
      }
      return next
    })
