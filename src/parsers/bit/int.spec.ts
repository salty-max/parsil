import { int } from './int'

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
    expect(() => int(33)).toThrow('int: n must be less than 32')
  })
})
