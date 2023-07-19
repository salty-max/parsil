import { Parser, ParserState, updateError } from '../../parser'

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
 * @returns {Parser<any>} A parser that applies the first successful parser in `parsers`.
 */

/* prettier-ignore */
export function choice<A>([p1]: [Parser<A>]): Parser<A>
/* prettier-ignore */
export function choice<A, B>([p1, p2]: [Parser<A>, Parser<B>]): Parser<A | B>
/* prettier-ignore */
export function choice<A, B, C>([p1, p2, p3]: [Parser<A>, Parser<B>, Parser<C>]): Parser<A | B | C>
/* prettier-ignore */
export function choice<A, B, C, D>([p1, p2, p3, p4]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>]): Parser<A | B | C | D>
/* prettier-ignore */
export function choice<A, B, C, D, E>([p1, p2, p3, p4, p5]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>]): Parser<A | B | C | D | E>
/* prettier-ignore */
export function choice<A, B, C, D, E, F>([p1, p2, p3, p4, p5, p6]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>]): Parser<A | B | C | D | E | F>
/* prettier-ignore */
export function choice<A, B, C, D, E, F, G>([p1, p2, p3, p4, p5, p6, p7]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>]): Parser<A | B | C | D | E | F | G>
/* prettier-ignore */
export function choice<A, B, C, D, E, F, G, H>([p1, p2, p3, p4, p5, p6, p7, p8]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>]): Parser<A | B | C | D | E | F | G | H>
/* prettier-ignore */
export function choice<A, B, C, D, E, F, G, H, I>([p1, p2, p3, p4, p5, p6, p7, p8, p9]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>]): Parser<A | B | C | D | E | F | G | H | I>
/* prettier-ignore */
export function choice<A, B, C, D, E, F, G, H, I, J>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>]): Parser<A | B | C | D | E | F | G | H | I | J>
/* prettier-ignore */
export function choice<A, B, C, D, E, F, G, H, I, J, K>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>, Parser<K>]): Parser<A | B | C | D | E | F | G | H | I | J | K>
/* prettier-ignore */
export function choice<A, B, C, D, E, F, G, H, I, J, K, L>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>, Parser<K>, Parser<L>]): Parser<A | B | C | D | E | F | G | H | I | J | K | L>
/* prettier-ignore */
export function choice<A, B, C, D, E, F, G, H, I, J, K, L, M>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>, Parser<K>, Parser<L>, Parser<M>]): Parser<A | B | C | D | E | F | G | H | I | J | K | L | M>
/* prettier-ignore */
export function choice<A, B, C, D, E, F, G, H, I, J, K, L, M, N>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>, Parser<K>, Parser<L>, Parser<M>, Parser<N>]): Parser<A | B | C | D | E | F | G | H | I | J | K | L | M | N>
/* prettier-ignore */
export function choice<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>, Parser<K>, Parser<L>, Parser<M>, Parser<N>, Parser<O>]): Parser<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O>
export function choice(parsers: Array<Parser<any>>): Parser<any> {
  if (parsers.length === 0)
    throw new Error('choice requires a non-empty list of parsers')

  return new Parser((state): ParserState<any, string> => {
    if (state.isError) return state

    for (const p of parsers) {
      const out = p.p(state)
      if (!out.isError) return out
    }

    return updateError(
      state,
      `ParseError @ index ${state.index} -> choice: Unable to match with any parser`
    )
  })
}
