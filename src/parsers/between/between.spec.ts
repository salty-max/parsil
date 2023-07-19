import { assertIsOk } from '../../util'
import { char } from '../char'
import { letters } from '../letters'
import { between } from './between'

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
