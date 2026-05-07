import {
  between,
  char,
  choice,
  digits,
  formatParseError,
  recursive,
  sepBy,
} from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('recursive', () => {
  const betweenSquareBrackets = between(char('['), char(']'))
  const commaSeparated = sepBy(char(','))

  const value = recursive(() => choice([digits, arrayParser]))
  const arrayParser = betweenSquareBrackets(commaSeparated(value))
  it('should parse nested arrays correctly', () => {
    const result = arrayParser.run('[1,[2,[3],4],5]')
    assertIsOk(result)
    expect(result.result).toStrictEqual(['1', ['2', ['3'], '4'], '5'])
  })

  it('should handle empty arrays', () => {
    const result = arrayParser.run('[]')
    assertIsOk(result)
    expect(result.result).toStrictEqual([])
  })

  it('should handle single element arrays', () => {
    const result = arrayParser.run('[1]')
    assertIsOk(result)
    expect(result.result).toStrictEqual(['1'])
  })

  it('should return an error for malformed arrays', () => {
    const result = arrayParser.run('[1,2,3,')
    assertIsError(result)
    expect(formatParseError(result.error)).toBe(
      "ParseError @ index 7 -> char: Expected ']', but got unexpected end of input"
    )
  })

  it('should return an error for arrays missing closing bracket', () => {
    const result = arrayParser.run('[1,2,3')
    assertIsError(result)
    expect(formatParseError(result.error)).toBe(
      "ParseError @ index 6 -> char: Expected ']', but got unexpected end of input"
    )
  })
})
