import { atLeast, digit } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('atLeast', () => {
  it('succeeds when threshold is met', () => {
    const r = atLeast(2)(digit).run('123')
    assertIsOk(r)
    expect(r.result).toEqual(['1', '2', '3'])
  })

  it('succeeds at exactly the threshold', () => {
    const r = atLeast(3)(digit).run('123')
    assertIsOk(r)
    expect(r.result).toEqual(['1', '2', '3'])
  })

  it('fails when fewer than n matches are available', () => {
    const r = atLeast(3)(digit).run('12x')
    assertIsError(r)
    expect(r.error.parser).toBe('atLeast')
    expect(r.error.message).toContain('Expected at least 3')
  })

  it('atLeast(0) always succeeds', () => {
    const r = atLeast(0)(digit).run('xyz')
    assertIsOk(r)
    expect(r.result).toEqual([])
  })

  it('throws on negative n', () => {
    expect(() => atLeast(-1)(digit)).toThrow(TypeError)
  })
})
