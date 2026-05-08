import { rawString } from '@parsil'
import { describe, expect, it } from 'bun:test'

// Regression: rawString reads one byte per char via uint(8), but
// `c.charCodeAt(0)` on non-ASCII returns the UTF-16 code unit rather
// than the actual byte sequence. This used to produce silently wrong
// matches; now construction throws.
describe('rawString — ASCII guard', () => {
  it('throws on non-ASCII input', () => {
    expect(() => rawString('café')).toThrow(/ASCII-only/)
    expect(() => rawString('日本語')).toThrow(/ASCII-only/)
    expect(() => rawString('é')).toThrow(/U\+00E9/)
  })

  it('still accepts ASCII input', () => {
    expect(() => rawString('hello')).not.toThrow()
    expect(() => rawString('!@#$%^&*()')).not.toThrow()
  })
})
