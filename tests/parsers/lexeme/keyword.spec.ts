import { formatParseError, keyword } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('keyword', () => {
  it('matches the keyword followed by a non-word character', () => {
    const result = keyword('let').run('let x = 1')

    assertIsOk(result)
    expect(result.result).toBe('let')
    expect(result.index).toBe(3)
  })

  it('matches the keyword at end of input', () => {
    const result = keyword('let').run('let')

    assertIsOk(result)
    expect(result.result).toBe('let')
    expect(result.index).toBe(3)
  })

  it('fails on a partial-prefix match', () => {
    const result = keyword('let').run('letter')

    assertIsError(result)
    expect(formatParseError(result.error)).toContain('keyword')
    expect(formatParseError(result.error)).toContain('word boundary')
  })

  it('fails when the keyword is not present', () => {
    const result = keyword('let').run('var x = 1')

    assertIsError(result)
    expect(formatParseError(result.error)).toContain("Expected 'let'")
    expect(formatParseError(result.error)).toContain('var')
  })

  it('fails on unexpected end of input', () => {
    const result = keyword('let').run('le')

    assertIsError(result)
    expect(formatParseError(result.error)).toContain('unexpected end of input')
  })

  it('treats a digit boundary as not-a-boundary', () => {
    const result = keyword('let').run('let123')

    assertIsError(result)
    expect(formatParseError(result.error)).toContain('word boundary')
  })

  it('treats an underscore boundary as not-a-boundary', () => {
    const result = keyword('let').run('let_x')

    assertIsError(result)
    expect(formatParseError(result.error)).toContain('word boundary')
  })

  it('treats whitespace as a valid boundary', () => {
    const result = keyword('let').run('let  x')

    assertIsOk(result)
    expect(result.result).toBe('let')
    expect(result.index).toBe(3)
  })

  it('treats punctuation as a valid boundary', () => {
    const result = keyword('let').run('let!')

    assertIsOk(result)
    expect(result.result).toBe('let')
  })

  it('is case-sensitive by default', () => {
    const result = keyword('let').run('Let x')

    assertIsError(result)
  })

  it('matches case-insensitively when caseSensitive is false', () => {
    const result = keyword('Let', { caseSensitive: false }).run('let x')

    assertIsOk(result)
    expect(result.result).toBe('let')
  })

  it('throws on construction when called with empty string', () => {
    expect(() => keyword('')).toThrow(
      "keyword must be called with a non-empty string, but got ''"
    )
  })
})
