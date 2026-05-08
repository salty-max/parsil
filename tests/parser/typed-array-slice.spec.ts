import { str, uint16BE } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsOk } from '../util/test-util'

// Regression: createParserState used to construct DataViews ignoring
// the typed array's byteOffset/byteLength. Sliced/offset typed arrays
// (very common from Node Buffer, file reads, network frames) had the
// parser see the entire underlying buffer, not the slice — yielding
// silent wrong matches or spurious EOI failures.
describe('createParserState — typed array byteOffset / byteLength', () => {
  it('respects the slice when the input is a Uint8Array view onto a larger buffer', () => {
    const full = new Uint8Array([0xaa, 0xbb, 0xcc, 0x68, 0x69]) // 'h', 'i' at offsets 3-4
    const slice = new Uint8Array(full.buffer, 3, 2)
    const r = str('hi').run(slice)
    assertIsOk(r)
    expect(r.result).toBe('hi')
    expect(r.index).toBe(2)
  })

  it('reads byte-level binary primitives off a sliced TypedArray correctly', () => {
    const full = new Uint8Array([0x99, 0x99, 0x12, 0x34, 0x99])
    const slice = new Uint8Array(full.buffer, 2, 2)
    const r = uint16BE.run(slice)
    assertIsOk(r)
    expect(r.result).toBe(0x1234)
  })

  it('fails on EOI relative to the slice, not the underlying buffer', () => {
    const full = new Uint8Array([0xaa, 0xbb, 0xcc, 0x68])
    const slice = new Uint8Array(full.buffer, 3, 1)
    // Slice has only 1 byte but the underlying buffer has 4. The
    // parser must see only the 1 byte and fail when asked for more.
    const r = str('hi').run(slice)
    expect(r.isError).toBe(true)
  })
})
