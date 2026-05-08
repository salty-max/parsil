import {
  char,
  endBy,
  letters,
  possibly,
  sepBy,
  sepEndBy,
  succeed,
} from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError } from '../../util/test-util'

// Regression: sepBy / sepEndBy / endBy loop forever when both the
// value and separator parsers succeed without consuming input.
// Surface as a clean parse failure with a diagnostic.
describe('sepBy — infinite-loop guard on no-progress', () => {
  it('fails clean when value and separator both make no progress', () => {
    // possibly(letters) always succeeds (with null on no match).
    // succeed('x') always succeeds without consuming. Combined: no
    // progress on either side.
    const parser = sepBy(succeed('x'))(possibly(letters))
    const r = parser.run('123')
    assertIsError(r)
    expect(r.error.parser).toBe('sepBy')
    expect(r.error.message).toContain('without consuming input')
  })

  it('still works when at least one of value/separator advances', () => {
    // value never advances (possibly), but separator does — safe.
    const parser = sepBy(char(','))(possibly(letters))
    const r = parser.run('abc,xyz,def')
    expect(r.isError).toBe(false)
  })
})

describe('sepEndBy — infinite-loop guard on no-progress', () => {
  it('fails clean when value and separator both make no progress', () => {
    const parser = sepEndBy(succeed('x'))(possibly(letters))
    const r = parser.run('123')
    assertIsError(r)
    expect(r.error.parser).toBe('sepEndBy')
  })
})

describe('endBy — infinite-loop guard on no-progress', () => {
  it('fails clean when value and terminator both make no progress', () => {
    const parser = endBy(succeed('x'))(succeed('v'))
    const r = parser.run('123')
    assertIsError(r)
    expect(r.error.parser).toBe('endBy')
  })
})
