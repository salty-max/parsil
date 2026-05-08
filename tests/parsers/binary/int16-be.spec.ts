import { int16BE } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('int16BE', () => {
  it('decodes [0xFF, 0xFE] as -2 (two-complement)', () => {
    const buf = new Uint8Array([0xff, 0xfe])
    const r = int16BE.run(new DataView(buf.buffer))
    assertIsOk(r)
    expect(r.result).toBe(-2)
  })

  it('decodes [0x00, 0x01] as 1', () => {
    const buf = new Uint8Array([0x00, 0x01])
    const r = int16BE.run(new DataView(buf.buffer))
    assertIsOk(r)
    expect(r.result).toBe(1)
  })

  it('fails on EOI', () => {
    const buf = new Uint8Array([0x12])
    const r = int16BE.run(new DataView(buf.buffer))
    assertIsError(r)
    expect(r.error.parser).toBe('int16BE')
  })
})
