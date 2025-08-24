import { describe, it, expect } from 'bun:test'
import { index, str } from '../../src'
import { assertIsOk } from '../util/test-util'

describe('parsers ▸ position ▸ index', () => {
  it('returns current byte offset without consuming', () => {
    const p = index
    const r1 = p.run('hello')
    assertIsOk(r1)
    expect(r1.result).toBe(0)
    expect(r1.index).toBe(0)

    const after = str('he').then(index)
    const r2 = after.run('hello')
    assertIsOk(r2)
    // consumed "he" (2 chars)
    expect(r2.result).toBe(2)
    expect(r2.index).toBe(2)
  })
})
