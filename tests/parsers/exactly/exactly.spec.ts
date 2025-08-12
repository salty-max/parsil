import { describe, expect, it } from 'bun:test'
import { digit, exactly, letter } from '../../../src'

describe('exactly', () => {
  it('should apply the parser exactly n times and collect the results in an array', () => {
    const parser = exactly(3)(letter)
    const result = parser.run('abc')

    expect(result).toEqual({
      isError: false,
      result: ['a', 'b', 'c'],
      index: 3,
    })
  })

  it('should return an error if the parser fails on any iteration', () => {
    const parser = exactly(3)(digit)
    const result = parser.run('a123')

    expect(result).toEqual({
      isError: true,
      error: "ParseError @ index 0 -> exactly: Expected 3 digit, but got 'a'",
      index: 0,
    })
  })

  it('should throw an error if n is a negative number', () => {
    expect(() => exactly(-2)(letter)).toThrow(TypeError)
  })

  it('should throw an error if n is not a number', () => {
    expect(() => exactly('2' as any)(letter)).toThrow(TypeError)
  })
})
