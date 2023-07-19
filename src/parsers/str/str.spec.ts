import { str } from './str' // replace with your actual module path

describe('str', () => {
  it('should correctly parse the target string', () => {
    const parser = str('foo')
    const res = parser.run('foo')

    expect(res).toEqual({
      index: 3,
      result: 'foo',
      isError: false,
    })
  })

  it('should return an error when the input does not match', () => {
    const parser = str('foo')
    const res = parser.run('bar')

    expect(res).toEqual({
      index: 0,
      isError: true,
      error: "ParseError (position: 0): Tried to match 'foo', but got 'bar...'",
    })
  })

  it('should return an error when the input string is empty', () => {
    const parser = str('foo')
    const res = parser.run('')

    expect(res).toEqual({
      index: 0,
      isError: true,
      error:
        "ParseError (position: 0): Tried to match 'foo', but got unexpected end of input",
    })
  })

  it('should throw error if target is empty', () => {
    expect(() => str('')).toThrow(
      `str must be called with a string with length > 1, but got ''`
    )
  })
})
