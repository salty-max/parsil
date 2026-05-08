import { doubleBE, doubleLE } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

const writeFloat64 = (value: number, littleEndian: boolean): Uint8Array => {
  const buf = new ArrayBuffer(8)
  new DataView(buf).setFloat64(0, value, littleEndian)
  return new Uint8Array(buf)
}

describe('doubleBE', () => {
  it('round-trips a 64-bit double in big-endian order', () => {
    const bytes = writeFloat64(Math.PI, false)
    const r = doubleBE.run(new DataView(bytes.buffer))
    assertIsOk(r)
    expect(r.result).toBe(Math.PI)
  })

  it('endianness sanity: BE bytes do not decode to LE double', () => {
    const beBytes = writeFloat64(Math.PI, false)
    const r = doubleLE.run(new DataView(beBytes.buffer))
    assertIsOk(r)
    expect(r.result).not.toBe(Math.PI)
  })

  it('fails on EOI', () => {
    const buf = new Uint8Array([0x12, 0x34, 0x56, 0x78])
    const r = doubleBE.run(new DataView(buf.buffer))
    assertIsError(r)
    expect(r.error.parser).toBe('doubleBE')
  })
})

describe('doubleLE', () => {
  it('round-trips a 64-bit double in little-endian order', () => {
    const bytes = writeFloat64(-Math.E, true)
    const r = doubleLE.run(new DataView(bytes.buffer))
    assertIsOk(r)
    expect(r.result).toBe(-Math.E)
  })

  it('fails on EOI', () => {
    const buf = new Uint8Array([0x12, 0x34, 0x56, 0x78])
    const r = doubleLE.run(new DataView(buf.buffer))
    assertIsError(r)
    expect(r.error.parser).toBe('doubleLE')
  })
})
