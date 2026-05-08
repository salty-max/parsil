import { atMost, digit } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsOk } from '../../util/test-util'

describe('atMost', () => {
  it('stops consuming after n matches', () => {
    const r = atMost(2)(digit).run('12345')
    assertIsOk(r)
    expect(r.result).toEqual(['1', '2'])
    expect(r.index).toBe(2)
  })

  it('succeeds with [] when nothing matches', () => {
    const r = atMost(3)(digit).run('xyz')
    assertIsOk(r)
    expect(r.result).toEqual([])
  })

  it('atMost(0) consumes nothing and succeeds', () => {
    const r = atMost(0)(digit).run('123')
    assertIsOk(r)
    expect(r.result).toEqual([])
    expect(r.index).toBe(0)
  })

  it('throws on negative n', () => {
    expect(() => atMost(-1)(digit)).toThrow(TypeError)
  })
})
