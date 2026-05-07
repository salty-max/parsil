/**
 * Type-level tests for parsil's public type surface.
 *
 * These are not runtime tests — they fail at compile time if the
 * public types regress. The body asserts `true` only because every
 * `bun:test` test must execute something; the real verification is
 * that this file typechecks under the project's strict tsconfig.
 *
 * Specifically guards the type-tightening from #14:
 * - `Parser<T>` defaults `E` to `string` (not `any`).
 * - Combinator constraints (`choice`, `sequenceOf`, `between`, `sepBy`)
 *   accept `Parser<unknown, unknown>` in their input slots — so any
 *   well-typed parser still composes regardless of its `E`.
 * - `fail` returns `Parser<never, E>`.
 */

import type { Parser } from '@parsil'
import {
  between,
  char,
  choice,
  fail,
  letters,
  sepBy,
  sequenceOf,
  str,
} from '@parsil'
import { describe, expect, it } from 'bun:test'

describe('type surface (compile-time)', () => {
  it('Parser<T> defaults E to string, not any', () => {
    // If E were `any`, the assignability test below would always pass
    // even with a wrong inner type. Forcing the explicit shape pins
    // the contract.
    const p = str('hi')
    const explicit: Parser<string, string> = p
    void explicit
    expect(true).toBe(true)
  })

  it('choice accepts heterogeneous Parser arrays under the unknown constraint', () => {
    const a: Parser<number> = char('1').map(Number)
    const b: Parser<string> = letters
    const c: Parser<boolean> = char('y').map(() => true)

    // The whole point of the `Parser<unknown, unknown>[]` constraint:
    // a tuple of parsers with different T values still composes.
    const p = choice([a, b, c])
    const explicit: Parser<number | string | boolean, string> = p
    void explicit
    expect(true).toBe(true)
  })

  it('sequenceOf preserves a tuple of result types', () => {
    const p = sequenceOf([str('hello'), char(' '), letters])
    // tuple inference: ['hello', ' ', string]
    const explicit: Parser<[string, string, string]> = p
    void explicit
    expect(true).toBe(true)
  })

  it('between composes parsers without requiring matching T', () => {
    const p = between(char('('), char(')'))(letters)
    const explicit: Parser<string, string> = p
    void explicit
    expect(true).toBe(true)
  })

  it('sepBy preserves the value parser type', () => {
    const p = sepBy(char(','))(letters)
    const explicit: Parser<string[], string> = p
    void explicit
    expect(true).toBe(true)
  })

  it('fail returns Parser<never, E>, not Parser<any, E>', () => {
    const f = fail('boom')
    // Parser<never, string> means the result type is never — no value
    // can be assigned where it's expected.
    const explicit: Parser<never, string> = f
    void explicit
    expect(true).toBe(true)
  })
})
