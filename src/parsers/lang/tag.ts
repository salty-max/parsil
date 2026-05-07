import { Parser } from '@parsil/parser'

/**
 * Replace the result of a parser with a constant value. Equivalent to
 * `p.map(() => value)`. Common when a syntactic marker should produce
 * a semantic constant (e.g., a keyword that just signals an enum).
 *
 * @example
 * const trueLit = tag(true)(keyword('true'))
 * const falseLit = tag(false)(keyword('false'))
 * choice([trueLit, falseLit]).run('false rest')
 * // result: false
 *
 * @param value The constant to yield on success.
 * @returns A function that takes a parser and returns a tagged parser.
 */
export const tag =
  <U>(value: U) =>
  <T>(p: Parser<T>): Parser<U> =>
    p.map(() => value)
