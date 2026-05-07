import { alphaNum, hexDigit, lower, octDigit, upper } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('alphaNum', () => {
  it('matches letters and digits', () => {
    expect(alphaNum.run('a').isError).toBe(false)
    expect(alphaNum.run('Z').isError).toBe(false)
    expect(alphaNum.run('5').isError).toBe(false)
  })

  it('rejects punctuation and whitespace', () => {
    const r = alphaNum.run('!')
    assertIsError(r)
    expect(r.error.expected).toBe('alphanumeric character')
  })
})

describe('hexDigit', () => {
  it('matches 0-9, a-f, A-F', () => {
    for (const ch of '0123456789abcdefABCDEF') {
      const r = hexDigit.run(ch)
      assertIsOk(r)
      expect(r.result).toBe(ch)
    }
  })

  it('rejects g-z and other characters', () => {
    const r = hexDigit.run('g')
    assertIsError(r)
    expect(r.error.expected).toBe('hex digit')
  })
})

describe('octDigit', () => {
  it('matches 0-7', () => {
    for (const ch of '01234567') {
      assertIsOk(octDigit.run(ch))
    }
  })

  it('rejects 8 and 9', () => {
    const r = octDigit.run('8')
    assertIsError(r)
    expect(r.error.expected).toBe('octal digit')
  })
})

describe('upper', () => {
  it('matches uppercase letters', () => {
    assertIsOk(upper.run('A'))
    assertIsOk(upper.run('Z'))
  })

  it('rejects lowercase and digits', () => {
    const r = upper.run('a')
    assertIsError(r)
    expect(r.error.expected).toBe('uppercase letter')
  })
})

describe('lower', () => {
  it('matches lowercase letters', () => {
    assertIsOk(lower.run('a'))
    assertIsOk(lower.run('z'))
  })

  it('rejects uppercase and digits', () => {
    const r = lower.run('A')
    assertIsError(r)
    expect(r.error.expected).toBe('lowercase letter')
  })
})
