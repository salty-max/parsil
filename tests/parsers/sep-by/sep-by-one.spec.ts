import { describe, expect, it } from 'bun:test'
import { char, digits, letters, sepByOne } from '../../../src'
import { assertIsError, assertIsOk } from '../../util/test-util'

describe('sepByOne', () => {
  it('should parse comma separated numbers', () => {
    const commaSeparatedNumbers = sepByOne(char(','))(digits)
    const result = commaSeparatedNumbers.run('1,2,3,4')

    assertIsOk(result)
    expect(result.result).toEqual(['1', '2', '3', '4'])
  })

  it('should parse comma separated words', () => {
    const commaSeparatedWords = sepByOne(char(','))(letters)
    const result = commaSeparatedWords.run('apple,banana,cherry')

    assertIsOk(result)
    expect(result.result).toEqual(['apple', 'banana', 'cherry'])
  })

  it('should return error if the input is empty', () => {
    const commaSeparatedWords = sepByOne(char(','))(letters)
    const result = commaSeparatedWords.run('')

    assertIsError(result)
    expect(result.error).toBe(
      'ParseError @ index 0 -> sepByOne: Expected to match at least one separated value'
    )
  })

  it('should return error if the first character is a separator', () => {
    const commaSeparatedWords = sepByOne(char(','))(letters)
    const result = commaSeparatedWords.run(',apple,banana,cherry')

    assertIsError(result)
    expect(result.error).toBe(
      'ParseError @ index 0 -> sepByOne: Expected to match at least one separated value'
    )
  })
})
