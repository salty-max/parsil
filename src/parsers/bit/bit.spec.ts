import { bit } from './bit'

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
})
