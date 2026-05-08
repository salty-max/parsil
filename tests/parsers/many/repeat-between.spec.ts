import { digit, repeatBetween } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('repeatBetween', () => {
  it('succeeds within bounds', () => {
    const r = repeatBetween(2, 4)(digit).run('1234567')
    assertIsOk(r)
    expect(r.result).toEqual(['1', '2', '3', '4'])
  })

  it('fails below the minimum', () => {
    const r = repeatBetween(2, 4)(digit).run('1')
    assertIsError(r)
    expect(r.error.parser).toBe('repeatBetween')
  })

  it('succeeds at exactly min', () => {
    const r = repeatBetween(2, 4)(digit).run('12x')
    assertIsOk(r)
    expect(r.result).toEqual(['1', '2'])
  })

  it('throws on invalid bounds', () => {
    expect(() => repeatBetween(-1, 3)(digit)).toThrow(TypeError)
    expect(() => repeatBetween(3, 1)(digit)).toThrow(TypeError)
  })
})
