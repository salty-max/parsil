import { int } from '@parsil'
import { describe, expect, it } from 'bun:test'

describe('int', () => {
  it('should parse positive integers correctly', () => {
    const parser = int(8)
    const input = new Uint8Array([42])

    const result = parser.run(new DataView(input.buffer))

    expect(result).toEqual({
      isError: false,
      result: 42,
      index: 8,
    })
  })

  it('should parse negative integers correctly', () => {
    const parser = int(8)
    const input = new Uint8Array([-42])

    const result = parser.run(new DataView(input.buffer))

    expect(result).toEqual({
      isError: false,
      result: -42,
      index: 8,
    })
  })

  it('should throw an error for invalid input', () => {
    expect(() => int(0)).toThrow('int: n must be larger than 0')
    expect(() => int(33)).toThrow('int: n must be less than or equal to 32')
  })

  it('accepts the boundary value n = 32', () => {
    // 32-bit signed int is a legitimate width; the previous error
    // message implied a stricter bound. Pin the actual contract.
    expect(() => int(32)).not.toThrow()
  })
})
