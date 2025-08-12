import { describe, expect, it } from 'bun:test'
import { one } from '../../../src'

describe('one', () => {
  it('should correctly parse a bit which is a 1', () => {
    const parser = one
    const input = new Uint8Array([0b10000000]) // Binary: 10000000

    const result = parser.run(new DataView(input.buffer))

    expect(result).toEqual({
      isError: false,
      index: 1,
      result: 1,
    })
  })

  it('should return an error if parsed bit is 0', () => {
    const parser = one
    const input = new Uint8Array([0b01000000]) // Binary: 10000000

    const result = parser.run(new DataView(input.buffer))

    expect(result).toEqual({
      isError: true,
      index: 0,
      error: 'ParseError @ index 0 -> one: Expected 1 but got 0',
    })
  })
})
