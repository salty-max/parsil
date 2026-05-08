import { floatLE } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

const writeFloat32 = (value: number, littleEndian: boolean): Uint8Array => {
  const buf = new ArrayBuffer(4)
  new DataView(buf).setFloat32(0, value, littleEndian)
  return new Uint8Array(buf)
}

describe('floatLE', () => {
  it('round-trips a 32-bit float in little-endian order', () => {
    const bytes = writeFloat32(-2.25, true)
    const r = floatLE.run(new DataView(bytes.buffer))
    assertIsOk(r)
    expect(r.result).toBeCloseTo(-2.25, 5)
  })

  it('fails on EOI', () => {
    const buf = new Uint8Array([0x12, 0x34])
    const r = floatLE.run(new DataView(buf.buffer))
    assertIsError(r)
    expect(r.error.parser).toBe('floatLE')
  })
})
