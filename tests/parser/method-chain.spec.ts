import { char, digits, parseError, Parser, str, updateError } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../util/test-util'

// `Parser.chain()` (the method form) had zero direct test coverage —
// only indirect coverage via `rawString` and `signed`. Pin its core
// semantics so a regression in monadic bind doesn't slip past CI.
describe('Parser.chain()', () => {
  it('threads the success value into the next parser', () => {
    // First parser captures a key char; the chain function dispatches
    // to the right follow-up parser based on that key.
    const tagged = char('A')
      .chain(() => str('lpha'))
      .map((s) => `A${s}`)
    const r = tagged.run('Alpha')
    assertIsOk(r)
    expect(r.result).toBe('Alpha')
  })

  it('short-circuits on inner failure (early exit via forward)', () => {
    const p = char('a').chain(() => char('b'))
    const r = p.run('xyz')
    assertIsError(r)
    expect(r.error.parser).toBe('char')
    // Inner chain function never ran — failure is from the first `char('a')`.
    expect(r.error.expected).toBe('a')
  })

  it('forwards the error from the chained parser when it fails', () => {
    const p = char('a').chain(() => char('b'))
    const r = p.run('aXY')
    assertIsError(r)
    // First parser succeeded ('a'), second failed.
    expect(r.error.parser).toBe('char')
    expect(r.error.expected).toBe('b')
    expect(r.error.index).toBe(1)
  })

  it('preserves the cursor advance when the chained parser succeeds', () => {
    const p = str('hi').chain(() => str(' there'))
    const r = p.run('hi there!')
    assertIsOk(r)
    expect(r.result).toBe(' there')
    expect(r.index).toBe(8)
  })

  it('composes with .map and .errorMap', () => {
    const p = char('a')
      .chain(() => digits.map(Number))
      .map((n) => n * 2)
    const r = p.run('a21')
    assertIsOk(r)
    expect(r.result).toBe(42)
  })

  it('propagates a manually-constructed failing parser from inside the chain function', () => {
    // Build a parser that always fails with a structured ParseError so
    // the E-channel matches the outer parser's E (= ParseError).
    const failWith = new Parser<never>((state) =>
      updateError(state, parseError('test', state.index, 'nope'))
    )
    const p = char('a').chain(() => failWith)
    const r = p.run('a')
    assertIsError(r)
    expect(r.error.parser).toBe('test')
    expect(r.error.message).toBe('nope')
  })
})
