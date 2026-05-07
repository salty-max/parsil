import { oneOf } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('oneOf', () => {
  it('matches when the next char is in the set', () => {
    const op = oneOf('+-*/')
    const result = op.run('+x')

    assertIsOk(result)
    expect(result.result).toBe('+')
  })

  it('fails when the next char is not in the set', () => {
    const op = oneOf('+-*/')
    const result = op.run('?x')

    assertIsError(result)
    expect(result.error.parser).toBe('satisfy')
    expect(result.error.expected).toContain('+-*/')
    expect(result.error.actual).toBe('?')
  })

  it('throws on construction with empty string', () => {
    expect(() => oneOf('')).toThrow(
      "oneOf must be called with a non-empty string, but got ''"
    )
  })

  it('handles multi-byte chars in the set', () => {
    const arrow = oneOf('→←↑↓')
    const result = arrow.run('→up')

    assertIsOk(result)
    expect(result.result).toBe('→')
  })
})
