import { stringLit } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('stringLit', () => {
  it('matches a double-quoted string', () => {
    const r = stringLit().run('"hello"')
    assertIsOk(r)
    expect(r.result).toBe('hello')
  })

  it('decodes \\n, \\t, \\r escapes', () => {
    const r = stringLit().run('"a\\nb\\tc\\rd"')
    assertIsOk(r)
    expect(r.result).toBe('a\nb\tc\rd')
  })

  it('decodes the escaped quote', () => {
    const r = stringLit().run('"he said \\"hi\\""')
    assertIsOk(r)
    expect(r.result).toBe('he said "hi"')
  })

  it('decodes the backslash escape', () => {
    const r = stringLit().run('"path\\\\to\\\\file"')
    assertIsOk(r)
    expect(r.result).toBe('path\\to\\file')
  })

  it('matches a single-quoted string when configured', () => {
    const r = stringLit("'").run("'it\\'s ok'")
    assertIsOk(r)
    expect(r.result).toBe("it's ok")
  })

  it('rejects unterminated strings', () => {
    const r = stringLit().run('"hello')
    assertIsError(r)
    expect(r.error.parser).toBe('stringLit')
  })

  it('rejects strings that cross a newline', () => {
    const r = stringLit().run('"line1\nline2"')
    assertIsError(r)
  })

  it('handles an empty string literal', () => {
    const r = stringLit().run('""rest')
    assertIsOk(r)
    expect(r.result).toBe('')
    expect(r.index).toBe(2)
  })
})
