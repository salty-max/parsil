import { noneOf } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('noneOf', () => {
  it('matches when the next char is not in the set', () => {
    const notDelim = noneOf(',;\n')
    const result = notDelim.run('abc')

    assertIsOk(result)
    expect(result.result).toBe('a')
  })

  it('fails when the next char is in the set', () => {
    const notDelim = noneOf(',;\n')
    const result = notDelim.run(',foo')

    assertIsError(result)
    expect(result.error.parser).toBe('satisfy')
    expect(result.error.actual).toBe(',')
  })

  it('throws on construction with empty string', () => {
    expect(() => noneOf('')).toThrow(
      "noneOf must be called with a non-empty string, but got ''"
    )
  })
})
