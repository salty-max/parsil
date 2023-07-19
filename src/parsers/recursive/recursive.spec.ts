import { Parser } from '../../parser'
import { assertIsError, assertIsOk } from '../../util'
import { between } from '../between'
import { char } from '../char'
import { choice } from '../choice'
import { digits } from '../digits'
import { sepBy } from '../sep-by'
import { recursive } from './recursive'

describe('Nested Array Parser', () => {
  let betweenSquareBrackets
  let commaSeparated
  let value
  let arrayParser: Parser<string>

  beforeEach(() => {
    betweenSquareBrackets = between(char('['), char(']'))
    commaSeparated = sepBy(char(','))

    value = recursive(() => choice([digits, arrayParser]))
    arrayParser = betweenSquareBrackets(
      commaSeparated(value)
    ) as unknown as Parser<string>
  })

  it('should parse nested arrays correctly', () => {
    const result = arrayParser.run('[1,[2,[3],4],5]')
    assertIsOk(result)
    expect(result.result).toEqual(['1', ['2', ['3'], '4'], '5'])
  })

  it('should handle empty arrays', () => {
    const result = arrayParser.run('[]')
    assertIsOk(result)
    expect(result.result).toEqual([])
  })

  it('should handle single element arrays', () => {
    const result = arrayParser.run('[1]')
    assertIsOk(result)
    expect(result.result).toEqual(['1'])
  })

  it('should return an error for malformed arrays', () => {
    const result = arrayParser.run('[1,2,3,')
    assertIsError(result)
    expect(result.error).toBe(
      `ParseError @ index 0 -> char: Expected ']', but got unexpected end of input`
    )
  })

  it('should return an error for arrays missing closing bracket', () => {
    const result = arrayParser.run('[1,2,3')
    assertIsError(result)
    expect(result.error).toBe(
      `ParseError @ index 0 -> char: Expected ']', but got unexpected end of input`
    )
  })
})
