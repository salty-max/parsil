import { describe, expect, it } from 'bun:test'
import { regex } from '../../../src'

describe('regex', () => {
  it('should correctly match the input against the regex pattern', () => {
    const pattern = /^[A-Za-z]+$/
    const input = 'abc'
    const parser = regex(pattern)
    const result = parser.run(input)

    expect(result).toEqual({
      index: 3,
      result: 'abc',
      isError: false,
    })
  })

  it('should return an error when the input does not match the regex pattern', () => {
    const pattern = /^\d+$/
    const input = 'abc'
    const parser = regex(pattern)
    const result = parser.run(input)

    expect(result).toEqual({
      index: 0,
      isError: true,
      error:
        "ParseError @ index 0 -> regex: Tried to match /^\\d+$/, got 'abc...'",
    })
  })

  it('should return an error when the input string is empty', () => {
    const pattern = /^\d+$/
    const input = ''
    const parser = regex(pattern)
    const result = parser.run(input)

    expect(result).toEqual({
      index: 0,
      isError: true,
      error:
        'ParseError @ index 0 -> regex: Tried to match /^\\d+$/, but got unexpected end of input',
    })
  })

  it('should throw an error if the pattern is not a RegExp', () => {
    const pattern = 'abc'
    expect(() => regex(pattern as unknown as RegExp)).toThrow(
      'regex must be called with a Regular Expression, but got [object String]'
    )
  })

  it('should throw an error if the pattern does not contain a start assertion (^)', () => {
    const pattern = /abc/
    expect(() => regex(pattern)).toThrow(
      "regex parsers must contain '^' start assertion"
    )
  })
})
