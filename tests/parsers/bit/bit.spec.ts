import { bit, exactly, formatParseError } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('bit', () => {
  it('should correctly parse a bit', () => {
    const parser = bit
    const input = new Uint8Array([0b10000000]) // Binary: 10000000

    const result = parser.run(new DataView(input.buffer))

    expect(result).toEqual({
      isError: false,
      index: 1,
      result: 1,
    })
  })

  it('fails cleanly past end of input instead of reading out-of-bounds bytes', () => {
    // Regression: the EOI check called updateError but did not return,
    // so the parser fell through to dataView.getUint8(byteOffset) on a
    // byteOffset already equal to byteLength.
    const input = new Uint8Array([0b10000000]) // 1 byte = 8 bits available
    const readNineBits = exactly(9)(bit)
    const result = readNineBits.run(new DataView(input.buffer))

    assertIsError(result)
    expect(formatParseError(result.error)).toContain('Unexpected end of input')
  })

  it('reads all 8 bits of a byte without overrunning', () => {
    const input = new Uint8Array([0b10101010])
    const readEightBits = exactly(8)(bit)
    const result = readEightBits.run(new DataView(input.buffer))

    assertIsOk(result)
    expect(result.result).toEqual([1, 0, 1, 0, 1, 0, 1, 0])
  })
})
