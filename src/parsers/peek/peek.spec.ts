import { peek } from './peek'

describe('peek', () => {
  it('should peek at the next byte without consuming it', () => {
    const data = new Uint8Array([1, 2, 3])
    const result = peek.run(new DataView(data.buffer))

    expect(result).toEqual({
      isError: false,
      result: 1,
      index: 0,
    })
  })

  it('should return an error if the input is empty', () => {
    const data = new Uint8Array([])
    const result = peek.run(new DataView(data.buffer))

    expect(result).toEqual({
      isError: true,
      error: 'ParseError @ index 0 -> peek: Unexpected end of input',
      index: 0,
    })
  })
})
