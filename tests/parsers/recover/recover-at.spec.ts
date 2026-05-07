import { char, recoverAt, sepBy, str } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsOk } from '../../util/test-util'

describe('recoverAt', () => {
  it('passes through on success (ok: true)', () => {
    const parser = recoverAt(str('hello'), char(';'))
    const result = parser.run('hello;')

    assertIsOk(result)
    expect(result.result).toEqual({ ok: true, value: 'hello' })
    expect(result.index).toBe(5)
  })

  it('recovers to next sync point on failure (ok: false)', () => {
    const parser = recoverAt(str('hello'), char(';'))
    const result = parser.run('NOPE;rest')

    // Outer parser sees a SUCCESS envelope...
    assertIsOk(result)
    // ...but the inner result is a recovered failure.
    expect(result.result.ok).toBe(false)
    if (!result.result.ok) {
      expect(result.result.error.parser).toBe('str')
      expect(result.result.index).toBe(0) // failure point
    }
    // Cursor advanced to the ';' position (4 bytes for "NOPE").
    expect(result.index).toBe(4)
  })

  it('collects multiple errors via sepBy(recoverAt(...))', () => {
    // Statement = single letter; separator = ';'
    const stmt = recoverAt(char('a'), char(';'))
    const program = sepBy(char(';'))(stmt)
    const result = program.run('a;b;a;a')

    assertIsOk(result)
    // Four results: 'a' (ok), 'b' (recovered failure), 'a', 'a'.
    expect(result.result).toHaveLength(4)
    expect(result.result[0]).toEqual({ ok: true, value: 'a' })
    expect(result.result[1].ok).toBe(false)
    expect(result.result[2]).toEqual({ ok: true, value: 'a' })
    expect(result.result[3]).toEqual({ ok: true, value: 'a' })
  })

  it('does not infinite-loop on failure at end of input', () => {
    const parser = recoverAt(str('hello'), char(';'))
    const result = parser.run('NOPE')

    assertIsOk(result)
    expect(result.result.ok).toBe(false)
    // Cursor walked to EOI without finding ';'.
    expect(result.index).toBe(4)
  })

  it('handles failure right at end of input', () => {
    const parser = recoverAt(str('hello'), char(';'))
    const result = parser.run('')

    assertIsOk(result)
    expect(result.result.ok).toBe(false)
    expect(result.index).toBe(0)
  })

  it('does not consume the sync marker itself', () => {
    const parser = recoverAt(str('hello'), char(';'))
    const result = parser.run('NOPE;')

    assertIsOk(result)
    // Cursor lands AT the ';' (index 4), not past it.
    expect(result.index).toBe(4)
  })

  it('sync match at the failure position consumes nothing', () => {
    // Edge case: p fails at a position where sync is already satisfied.
    const parser = recoverAt(str('hello'), char(';'))
    const result = parser.run(';nothing-here')

    assertIsOk(result)
    expect(result.result.ok).toBe(false)
    expect(result.index).toBe(0) // didn't advance because sync matched immediately
  })
})
