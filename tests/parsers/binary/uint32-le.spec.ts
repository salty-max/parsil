import { uint32LE } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('uint32LE', () => {
  it('decodes [0x12, 0x34, 0x56, 0x78] as 0x78563412', () => {
    const buf = new Uint8Array([0x12, 0x34, 0x56, 0x78])
    const r = uint32LE.run(new DataView(buf.buffer))
    assertIsOk(r)
    expect(r.result).toBe(0x78563412)
    expect(r.index).toBe(4)
  })

  it('reads 0xFFFFFFFF as 4294967295 (unsigned)', () => {
    const buf = new Uint8Array([0xff, 0xff, 0xff, 0xff])
    const r = uint32LE.run(new DataView(buf.buffer))
    assertIsOk(r)
    expect(r.result).toBe(0xffffffff)
  })

  it('fails on EOI', () => {
    const buf = new Uint8Array([0x12, 0x34])
    const r = uint32LE.run(new DataView(buf.buffer))
    assertIsError(r)
    expect(r.error.parser).toBe('uint32LE')
  })
})
