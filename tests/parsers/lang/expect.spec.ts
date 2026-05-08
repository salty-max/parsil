import { digits, expect as expectFn, intLit, str } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('expect', () => {
  it('passes through success unchanged', () => {
    const p = expectFn(intLit, 'a port number (0-65535)')
    const r = p.run('42 rest')
    assertIsOk(r)
    expect(r.result).toBe(42)
    expect(r.index).toBe(2)
  })

  it("replaces only the failure's `message`, keeps `parser` identity", () => {
    const p = expectFn(intLit, 'a port number (0-65535)')
    const r = p.run('foo')
    assertIsError(r)
    expect(r.error.message).toBe('a port number (0-65535)')
    // The inner parser identity is preserved; this is what differentiates
    // `expect` from `label` (which replaces the parser identity too).
    expect(r.error.parser).toBe('intLit')
  })

  it('preserves expected / actual / context from the inner error', () => {
    const p = expectFn(digits, 'one or more digits')
    const r = p.run('abc')
    assertIsError(r)
    expect(r.error.message).toBe('one or more digits')
    // digits emits `expected: '[0-9]+'` — expect must not erase it.
    expect(r.error.expected).toBe('[0-9]+')
  })

  it('composes with str-based parsers', () => {
    const p = expectFn(str('hello'), 'a friendly greeting')
    const r = p.run('goodbye')
    assertIsError(r)
    expect(r.error.message).toBe('a friendly greeting')
    expect(r.error.parser).toBe('str')
  })
})
