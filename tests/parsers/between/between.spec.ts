import { describe, expect, it } from 'bun:test'
import { between, char, letters } from '../../../src'
import { assertIsOk } from '../../util/test-util'

describe('between', () => {
  it('should correctly parse content between left and right parsers', () => {
    // A parser that matches a string enclosed in double quotes
    const quotedStringParser = between(char(`"`), char(`"`))(letters)

    // Test the parser with a quoted string
    const result = quotedStringParser.run(`"HelloWorld"`)

    // The result should be an Ok with the string without the quotes
    assertIsOk(result)
    expect(result.result).toEqual('HelloWorld')
  })
})
