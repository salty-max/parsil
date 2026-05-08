import { anyByte } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('anyByte', () => {
  it('reads a single unsigned byte', () => {
    const buf = new Uint8Array([0x2a, 0xff])
    const r = anyByte.run(new DataView(buf.buffer))
    assertIsOk(r)
    expect(r.result).toBe(42)
    expect(r.index).toBe(1)
  })

  it('reads 0xFF as 255 (unsigned)', () => {
    const buf = new Uint8Array([0xff])
    const r = anyByte.run(new DataView(buf.buffer))
    assertIsOk(r)
    expect(r.result).toBe(255)
  })

  it('fails on EOI with structured ParseError', () => {
    const buf = new Uint8Array([])
    const r = anyByte.run(new DataView(buf.buffer))
    assertIsError(r)
    expect(r.error.parser).toBe('anyByte')
    expect(r.error.message).toContain('unexpected end of input')
  })
})
