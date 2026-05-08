import { floatBE, floatLE } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

const writeFloat32 = (value: number, littleEndian: boolean): Uint8Array => {
  const buf = new ArrayBuffer(4)
  new DataView(buf).setFloat32(0, value, littleEndian)
  return new Uint8Array(buf)
}

describe('floatBE', () => {
  it('round-trips a 32-bit float in big-endian order', () => {
    const bytes = writeFloat32(3.5, false)
    const r = floatBE.run(new DataView(bytes.buffer))
    assertIsOk(r)
    expect(r.result).toBeCloseTo(3.5, 5)
  })

  it('endianness sanity: BE bytes do not decode to LE float', () => {
    // Round-tripping the same bytes through floatLE must NOT recover the
    // original value — this pins endianness handling.
    const beBytes = writeFloat32(1.5, false)
    const r = floatLE.run(new DataView(beBytes.buffer))
    assertIsOk(r)
    expect(r.result).not.toBeCloseTo(1.5, 5)
  })

  it('fails on EOI', () => {
    const buf = new Uint8Array([0x12, 0x34])
    const r = floatBE.run(new DataView(buf.buffer))
    assertIsError(r)
    expect(r.error.parser).toBe('floatBE')
  })
})
