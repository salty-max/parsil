import { describe, expect, it } from 'bun:test'
import { char } from '../../../src'

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
      error: "ParseError @ index 0 -> char: Expected '@', but got '$'",
    })
  })

  it('should return an error when the input string is empty', () => {
    const parser = char('@')
    const res = parser.run('')

    expect(res).toEqual({
      index: 0,
      isError: true,
      error:
        "ParseError @ index 0 -> char: Expected '@', but got unexpected end of input",
    })
  })

  it('should throw error if target is not a single character', () => {
    expect(() => char('')).toThrow(
      `char must be called with a single character, but got ''`
    )
  })
})
