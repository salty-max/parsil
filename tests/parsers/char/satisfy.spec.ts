import { satisfy } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('satisfy', () => {
  it('matches a character that satisfies the predicate', () => {
    const vowel = satisfy((c) => 'aeiou'.includes(c), 'vowel')
    const result = vowel.run('apple')

    assertIsOk(result)
    expect(result.result).toBe('a')
    expect(result.index).toBe(1)
  })

  it('fails when the predicate rejects the next character', () => {
    const vowel = satisfy((c) => 'aeiou'.includes(c), 'vowel')
    const result = vowel.run('xyz')

    assertIsError(result)
    expect(result.error.parser).toBe('satisfy')
    expect(result.error.expected).toBe('vowel')
    expect(result.error.actual).toBe('x')
    expect(result.error.message).toContain("Expected vowel, but got 'x'")
  })

  it('fails on end of input', () => {
    const vowel = satisfy((c) => 'aeiou'.includes(c), 'vowel')
    const result = vowel.run('')

    assertIsError(result)
    expect(result.error.parser).toBe('satisfy')
    expect(result.error.message).toContain('unexpected end of input')
  })

  it('uses a default label when none is provided', () => {
    const ascii = satisfy((c) => c.charCodeAt(0) < 128)
    const result = ascii.run('é')

    assertIsError(result)
    expect(result.error.expected).toBe('a character matching the predicate')
  })

  it('handles multi-byte UTF-8 characters', () => {
    const cjk = satisfy((c) => /^\p{Script=Han}$/u.test(c), 'CJK character')
    const result = cjk.run('日本語')

    assertIsOk(result)
    expect(result.result).toBe('日')
    // '日' is 3 bytes in UTF-8
    expect(result.index).toBe(3)
  })
})
