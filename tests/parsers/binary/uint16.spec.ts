import { uint16BE, uint16LE } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('uint16BE', () => {
  it('decodes [0x12, 0x34] as 0x1234', () => {
    const buf = new Uint8Array([0x12, 0x34])
    const r = uint16BE.run(new DataView(buf.buffer))
    assertIsOk(r)
    expect(r.result).toBe(0x1234)
    expect(r.index).toBe(2)
  })

  it('reads 0xFFFF as 65535 (unsigned)', () => {
    const buf = new Uint8Array([0xff, 0xff])
    const r = uint16BE.run(new DataView(buf.buffer))
    assertIsOk(r)
    expect(r.result).toBe(65535)
  })

  it('fails on EOI', () => {
    const buf = new Uint8Array([0x12])
    const r = uint16BE.run(new DataView(buf.buffer))
    assertIsError(r)
    expect(r.error.parser).toBe('uint16BE')
  })
})

describe('uint16LE', () => {
  it('decodes [0x12, 0x34] as 0x3412', () => {
    const buf = new Uint8Array([0x12, 0x34])
    const r = uint16LE.run(new DataView(buf.buffer))
    assertIsOk(r)
    expect(r.result).toBe(0x3412)
  })

  it('fails on EOI', () => {
    const buf = new Uint8Array([0x12])
    const r = uint16LE.run(new DataView(buf.buffer))
    assertIsError(r)
    expect(r.error.parser).toBe('uint16LE')
  })
})
