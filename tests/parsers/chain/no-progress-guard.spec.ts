import { chainl1, chainr1, succeed } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError } from '../../util/test-util'

// Regression: chainl1 / chainr1 loop forever when both the operand
// and operator parsers succeed without consuming input. Surface as a
// clean parse failure.
describe('chainl1 — infinite-loop guard on no-progress', () => {
  it('fails clean when operand and operator both make no progress', () => {
    const parser = chainl1<number>(
      succeed(0),
      succeed((a: number, b: number) => a + b)
    )
    const r = parser.run('123')
    assertIsError(r)
    expect(r.error.parser).toBe('chainl1')
    expect(r.error.message).toContain('without consuming input')
  })
})

describe('chainr1 — infinite-loop guard on no-progress', () => {
  it('fails clean when operand and operator both make no progress', () => {
    const parser = chainr1<number>(
      succeed(0),
      succeed((a: number, b: number) => a + b)
    )
    const r = parser.run('123')
    assertIsError(r)
    expect(r.error.parser).toBe('chainr1')
  })
})
