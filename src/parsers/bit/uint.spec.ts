import { uint } from './uint'

describe('uint', () => {
  it('should parse unsigned integers correctly', () => {
    const parser = uint(8)
    const input = new Uint8Array([42])

    const result = parser.run(new DataView(input.buffer))

    expect(result).toEqual({
      isError: false,
      result: 42,
      index: 8,
    })
  })

  it('should throw an error for invalid input', () => {
    expect(() => uint(0)).toThrow('int: n must be larger than 0')
    expect(() => uint(33)).toThrow('int: n must be less than 32')
  })
})
