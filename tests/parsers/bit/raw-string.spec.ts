import { describe, expect, it } from 'bun:test'
import { rawString } from '../../../src'

describe('rawString', () => {
  it('should parse the input string correctly', () => {
    const parser = rawString('Hello')

    expect(parser.run('Hello')).toEqual({
      isError: false,
      result: [72, 101, 108, 108, 111],
      index: 40,
    })
  })

  it('should throw an error for empty input string', () => {
    expect(() => rawString('')).toThrow(
      'rawString: input must be at least 1 character'
    )
  })

  it('should throw an error for mismatched characters', () => {
    const parser = rawString('Hello')

    expect(parser.run('World')).toStrictEqual({
      isError: true,
      error: 'ParseError -> rawString: Expected character H, but got W',
      index: 8,
    })
  })
})
