/**
 * Type-level tests for parsil's public type surface.
 *
 * These are not runtime tests — they fail at compile time if the
 * public types regress. The body asserts `true` only because every
 * `bun:test` test must execute something; the real verification is
 * that this file typechecks under the project's strict tsconfig.
 *
 * Specifically guards:
 * - `Parser<T>` defaults `E` to `ParseError` (#24 error-model overhaul).
 * - Combinator constraints (`choice`, `sequenceOf`, `between`, `sepBy`)
 *   accept `Parser<unknown, unknown>` in their input slots — so any
 *   well-typed parser still composes regardless of its `E`.
 * - `fail` returns `Parser<never, E>`.
 * - `StateTransformerFn`'s input result slot is `unknown`, never `any`
 *   (#29 strict-any frontier).
 */

import type { ParseError, Parser, StateTransformerFn } from '@parsil'
import {
  atLeast,
  atMost,
  between,
  char,
  choice,
  digit,
  exactly,
  fail,
  letters,
  repeatBetween,
  sepBy,
  sequenceOf,
  str,
} from '@parsil'
import { describe, expect, it } from 'bun:test'

// Famous `IsAny<T>` trick: `1 & any` is `any`, and `0 extends any` is
// `true`. For any other `T` (including `unknown`), `1 & T` either
// resolves to a narrower type that does not include `0`, or is `never`.
type IsAny<T> = 0 extends 1 & T ? true : false

/**
 * Compile-time `expect(notAny)`: instantiates to `true` when `T` is
 * not `any`, and to `never` when it is. The `const _: _Check = true`
 * pattern below fails to typecheck if `T` regresses to `any`.
 */
type AssertNotAny<T> = IsAny<T> extends false ? true : never

describe('type surface (compile-time)', () => {
  it('Parser<T> defaults E to ParseError', () => {
    // The error model overhaul (#24) changed the default error type
    // from `string` to the structured `ParseError`. Pin that here.
    const p = str('hi')
    const explicit: Parser<string, ParseError> = p
    void explicit
    expect(true).toBe(true)
  })

  it('choice accepts heterogeneous Parser arrays under the unknown constraint', () => {
    const a: Parser<number> = char('1').map(Number)
    const b: Parser<string> = letters
    const c: Parser<boolean> = char('y').map(() => true)

    // The whole point of the `Parser<unknown, E>[]` constraint:
    // a tuple of parsers with different T values still composes when
    // they share E.
    const p = choice([a, b, c])
    const explicit: Parser<number | string | boolean, ParseError> = p
    void explicit
    expect(true).toBe(true)
  })

  it('sequenceOf yields an array typed by the (currently widened) element union', () => {
    const p = sequenceOf([str('hello'), char(' '), letters])
    // TS widens the array literal to `Parser<string, ParseError>[]` at
    // the call site, so the mapped tuple inference reduces to
    // `string[]`. Preserving exact tuple shape would require `as const`
    // at every call site, which is too noisy. The output is still
    // `string[]` (correct at runtime) — just not `[string, string,
    // string]` at the type level.
    const explicit: Parser<string[], ParseError> = p
    void explicit
    expect(true).toBe(true)
  })

  it('between preserves the content parser type via deferred-T inference', () => {
    // `between(left, right)(content)` declares its `T` on the inner
    // curried call so call-site inference flows from `content` directly.
    // If T were on the outer generic it would resolve to `unknown` here.
    const p = between(char('('), char(')'))(letters)
    const explicit: Parser<string, ParseError> = p
    void explicit
    expect(true).toBe(true)
  })

  it('sepBy preserves the value parser type via deferred-V inference', () => {
    const p = sepBy(char(','))(letters)
    const explicit: Parser<string[], ParseError> = p
    void explicit
    expect(true).toBe(true)
  })

  it('exactly / atLeast / atMost / repeatBetween defer T to the second curried call', () => {
    // All four count-prefixed combinators take `(n)` first and the
    // parser second. Their `T` generic must live on the inner call so
    // call-site inference flows from the parser argument; otherwise
    // each one degrades to `Parser<unknown[], ParseError>`.
    const p1 = exactly(3)(letters)
    const e1: Parser<string[], ParseError> = p1
    void e1

    const p2 = atLeast(2)(digit)
    const e2: Parser<string[], ParseError> = p2
    void e2

    const p3 = atMost(4)(digit)
    const e3: Parser<string[], ParseError> = p3
    void e3

    const p4 = repeatBetween(2, 5)(digit)
    const e4: Parser<string[], ParseError> = p4
    void e4

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

  it("StateTransformerFn's input result slot is `unknown`, never `any` (#29)", () => {
    // Pin the post-#29 boundary: a parser must observe its predecessor
    // state with `result: unknown` (so it cannot accidentally read
    // upstream T) and `error: E` (typed). Re-introducing `any` at any
    // of these positions makes `AssertNotAny` resolve to `never`, and
    // the `const _: ... = true` line below fails to compile.
    type Input = Parameters<StateTransformerFn<string, ParseError>>[0]
    type ResultSlot = Input['result']
    type ErrorSlot = Input['error']

    const _resultSlotIsNotAny: AssertNotAny<ResultSlot> = true
    const _errorSlotIsNotAny: AssertNotAny<ErrorSlot> = true
    void _resultSlotIsNotAny
    void _errorSlotIsNotAny
    expect(true).toBe(true)
  })
})
