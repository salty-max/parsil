import { succeed } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsOk } from '../../util/test-util'

describe('succeed', () => {
  it('always succeeds with the given value, leaving the cursor untouched', () => {
    const r = succeed(42).run('anything')
    assertIsOk(r)
    expect(r.result).toBe(42)
    expect(r.index).toBe(0)
  })

  it('succeeds on empty input', () => {
    const r = succeed('hello').run('')
    assertIsOk(r)
    expect(r.result).toBe('hello')
    expect(r.index).toBe(0)
  })

  it('preserves the literal type of the value via inference', () => {
    // The compile-time check is that `succeed({ kind: 'X' as const })`
    // produces a Parser<{ kind: 'X' }>, and the runtime check is that
    // the result envelope has the same value identity.
    const node = { kind: 'literal' as const, value: 7 }
    const r = succeed(node).run('input')
    assertIsOk(r)
    expect(r.result).toBe(node)
  })
})
