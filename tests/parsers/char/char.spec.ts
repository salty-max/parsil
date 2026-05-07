import { char, formatParseError, sequenceOf, str } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError } from '../../util/test-util'

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
      error: expect.objectContaining({
        parser: 'char',
        index: 0,
        message: `Expected '@', but got '$'`,
      }),
    })
  })

  it('should return an error when the input string is empty', () => {
    const parser = char('@')
    const res = parser.run('')

    expect(res).toEqual({
      index: 0,
      isError: true,
      error: expect.objectContaining({
        parser: 'char',
        index: 0,
        message: `Expected '@', but got unexpected end of input`,
      }),
    })
  })

  it('should throw error if target is not a single character', () => {
    expect(() => char('')).toThrow(
      `char must be called with a single character, but got ''`
    )
  })

  it('reports the actual index in error messages, not a hardcoded 0', () => {
    // Regression: char.ts used to interpolate `@ index 0` literally,
    // so every char failure looked like it was at the start of input
    // even when it was deeper in a sequence.
    const parser = sequenceOf([str('hello '), char('!')])
    const res = parser.run('hello world')

    assertIsError(res)
    expect(formatParseError(res.error)).toBe(
      "ParseError @ index 6 -> char: Expected '!', but got 'w'"
    )
  })

  it('reports the actual index on end-of-input errors', () => {
    const parser = sequenceOf([str('abc'), char('!')])
    const res = parser.run('abc')

    assertIsError(res)
    expect(formatParseError(res.error)).toBe(
      "ParseError @ index 3 -> char: Expected '!', but got unexpected end of input"
    )
  })
})
