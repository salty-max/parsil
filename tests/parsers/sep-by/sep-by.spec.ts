import { describe, expect, it } from 'bun:test'
import { char, digits, letters, sepBy } from '../../../src'
import { assertIsOk } from '../../util/test-util'

describe('sepBy', () => {
  it('should parse comma separated numbers', () => {
    const commaSeparatedNumbers = sepBy(char(','))(digits)
    const result = commaSeparatedNumbers.run('1,2,3,4')

    assertIsOk(result)
    expect(result.result).toEqual(['1', '2', '3', '4'])
  })

  it('should parse comma separated words', () => {
    const commaSeparatedWords = sepBy(char(','))(letters)
    const result = commaSeparatedWords.run('apple,banana,cherry')

    assertIsOk(result)
    expect(result.result).toEqual(['apple', 'banana', 'cherry'])
  })

  it('should return an empty array if the input is empty', () => {
    const commaSeparatedWords = sepBy(char(','))(letters)
    const result = commaSeparatedWords.run('')

    assertIsOk(result)
    expect(result.result).toEqual([])
  })
})
