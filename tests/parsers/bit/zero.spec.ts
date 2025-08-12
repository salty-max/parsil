import { describe, expect, it } from 'bun:test'
import { zero } from '../../../src'

describe('zero', () => {
  it('should correctly parse a bit which is a 0', () => {
    const parser = zero
    const input = new Uint8Array([0b01000000]) // Binary: 10000000

    const result = parser.run(new DataView(input.buffer))

    expect(result).toEqual({
      isError: false,
      index: 1,
      result: 0,
    })
  })

  it('should return an error if parsed bit is 1', () => {
    const parser = zero
    const input = new Uint8Array([0b10000000]) // Binary: 10000000

    const result = parser.run(new DataView(input.buffer))

    expect(result).toEqual({
      isError: true,
      index: 0,
      error: 'ParseError @ index 0 -> zero: Expected 0 but got 1',
    })
  })
})
