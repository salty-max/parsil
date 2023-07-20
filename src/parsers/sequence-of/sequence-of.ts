import { Parser, updateResult } from '../../parser/parser'

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
 * @returns {Parser<any>} A parser that applies `parsers` in sequence.
 */

export function sequenceOf<A>([p1]: [Parser<A>]): Parser<[A]>
export function sequenceOf<A, B>([p1, p2]: [Parser<A>, Parser<B>]): Parser<[A, B]>
export function sequenceOf<A, B, C>([p1, p2, p3]: [Parser<A>, Parser<B>, Parser<C>]): Parser<[A, B, C]>
export function sequenceOf<A, B, C, D>([p1, p2, p3, p4]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>]): Parser<[A, B, C, D]>
export function sequenceOf<A, B, C, D, E>([p1, p2, p3, p4, p5]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>]): Parser<[A, B, C, D, E]>
export function sequenceOf<A, B, C, D, E, F>([p1, p2, p3, p4, p5, p6]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>]): Parser<[A, B, C, D, E, F]>
export function sequenceOf<A, B, C, D, E, F, G>([p1, p2, p3, p4, p5, p6, p7]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>]): Parser<[A, B, C, D, E, F, G]>
export function sequenceOf<A, B, C, D, E, F, G, H>([p1, p2, p3, p4, p5, p6, p7, p8]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>]): Parser<[A, B, C, D, E, F, G, H]>
export function sequenceOf<A, B, C, D, E, F, G, H, I>([p1, p2, p3, p4, p5, p6, p7, p8, p9]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>]): Parser<[A, B, C, D, E, F, G, H, I]>
export function sequenceOf<A, B, C, D, E, F, G, H, I, J>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>]): Parser<[A, B, C, D, E, F, G, H, I, J]>
export function sequenceOf<A, B, C, D, E, F, G, H, I, J, K>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>, Parser<K>]): Parser<[A, B, C, D, E, F, G, H, I, J, K]>
export function sequenceOf<A, B, C, D, E, F, G, H, I, J, K, L>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>, Parser<K>, Parser<L>]): Parser<[A, B, C, D, E, F, G, H, I, J, K, L]>
export function sequenceOf<A, B, C, D, E, F, G, H, I, J, K, L, M>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>, Parser<K>, Parser<L>, Parser<M>]): Parser<[A, B, C, D, E, F, G, H, I, J, K, L, M]>
export function sequenceOf<A, B, C, D, E, F, G, H, I, J, K, L, M, N>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>, Parser<K>, Parser<L>, Parser<M>, Parser<N>]): Parser<[A, B, C, D, E, F, G, H, I, J, K, L, M, N]>
export function sequenceOf<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>, Parser<K>, Parser<L>, Parser<M>, Parser<N>, Parser<O>]): Parser<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O]>
export function sequenceOf(parsers: Parser<any>[]): Parser<any[]>
export function sequenceOf(parsers: Parser<any>[]): Parser<any[]> {
  return new Parser((state) => {
    if (state.isError) return state

    const results = []
    let nextState = state

    for (const p of parsers) {
      const out = p.p(nextState)

      if (out.isError) return out

      nextState = out
      results.push(out.result)
    }

    return updateResult(nextState, results)
  })
}
