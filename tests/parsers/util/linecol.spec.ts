import { linecol } from '@parsil'
import { describe, expect, it } from 'bun:test'

describe('linecol', () => {
  it('returns (1, 1) at the start', () => {
    expect(linecol('hello', 0)).toEqual({ line: 1, col: 1 })
  })

  it('counts columns within the first line', () => {
    expect(linecol('hello', 4)).toEqual({ line: 1, col: 5 })
  })

  it('handles LF line endings', () => {
    // 'foo\nbar' — index 4 is 'b', second line, col 1
    expect(linecol('foo\nbar', 4)).toEqual({ line: 2, col: 1 })
    expect(linecol('foo\nbar', 6)).toEqual({ line: 2, col: 3 })
  })

  it('handles CR line endings (classic Mac)', () => {
    expect(linecol('foo\rbar', 4)).toEqual({ line: 2, col: 1 })
  })

  it('handles CRLF line endings (Windows)', () => {
    // 'a\r\nb' — index 3 is 'b' on line 2 col 1; CRLF must count as one break
    expect(linecol('a\r\nb', 3)).toEqual({ line: 2, col: 1 })
  })

  it('counts multiple line breaks', () => {
    expect(linecol('a\nb\nc\nd', 6)).toEqual({ line: 4, col: 1 })
  })

  it('clamps a negative index to (1, 1)', () => {
    expect(linecol('hello', -5)).toEqual({ line: 1, col: 1 })
  })

  it('clamps an out-of-bounds index to the input end', () => {
    expect(linecol('abc', 999)).toEqual({ line: 1, col: 4 })
  })

  it('accepts a DataView as input', () => {
    const buf = new TextEncoder().encode('foo\nbar')
    const dv = new DataView(buf.buffer)
    expect(linecol(dv, 6)).toEqual({ line: 2, col: 3 })
  })
})
