import { Parser } from '@parsil/parser'
import { sequenceOf } from '@parsil/parsers/sequence-of'

/**
 * Run two to five parsers in sequence and combine their results with a
 * function. Shorthand for `sequenceOf([...]).map(([a, b, ...]) =>
 * fn(a, b, ...))`.
 *
 * Useful when you have a clear AST node shape: `apply(p1, p2, p3,
 * (a, b, c) => ({ kind: 'X', a, b, c }))` reads top-to-bottom without
 * the destructuring noise of `.map`.
 *
 * @example
 * const assign = apply(identifier, tok(char('=')), intLit,
 *   (name, _eq, value) => ({ name, value }))
 * assign.run('age = 42')
 * // result: { name: 'age', value: 42 }
 *
 * @param a Parser for the first slot.
 * @param b Parser for the second slot.
 * @param fn Function combining the parsed values.
 * @returns A parser yielding `fn(a, b, ...)` on success.
 */
export function apply<A, B, R>(
  a: Parser<A>,
  b: Parser<B>,
  fn: (a: A, b: B) => R
): Parser<R>
export function apply<A, B, C, R>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  fn: (a: A, b: B, c: C) => R
): Parser<R>
export function apply<A, B, C, D, R>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  fn: (a: A, b: B, c: C, d: D) => R
): Parser<R>
export function apply<A, B, C, D, E, R>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
  fn: (a: A, b: B, c: C, d: D, e: E) => R
): Parser<R>
export function apply<R>(...args: unknown[]): Parser<R> {
  const fn = args[args.length - 1] as (...xs: unknown[]) => R
  const parsers = args.slice(0, -1) as Parser<unknown>[]
  return sequenceOf(parsers).map((results) => fn(...results))
}
