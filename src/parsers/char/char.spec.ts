import { char } from './char' // replace with your actual module path

describe('char', () => {
  it('should correctly parse the target string', () => {
    const parser = char('@')
    const res = parser.run('@')

    expect(res).toEqual({
      index: 1,
      result: '@',
      isError: false,
    })
  })

  it('should return an error when the input does not match', () => {
    const parser = char('@')
    const res = parser.run('$')

    expect(res).toEqual({
      index: 0,
      isError: true,
      error: "ParseError (position: 0): Expected '@', but got '$'",
    })
  })

  it('should return an error when the input string is empty', () => {
    const parser = char('@')
    const res = parser.run('')

    expect(res).toEqual({
      index: 0,
      isError: true,
      error:
        "ParseError (position: 0): Expected '@', but got unexpected end of input",
    })
  })
})