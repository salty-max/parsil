import { describe, it, expect } from 'bun:test'
import { endOfInput, sequenceOf, str } from '../../../src'
import { assertIsError, assertIsOk } from '../../util/test-util'

describe('endOfInput', () => {
  it('should successfully parse if the input has been fully consumed', () => {
    const parser = sequenceOf([str('abc'), endOfInput])
    const result = parser.run('abc')

    assertIsOk(result)

    expect(result).toStrictEqual({
      isError: false,
      result: ['abc', null],
      index: 3,
    })
  })

  it('should fail if the input has not been fully consumed', () => {
    const parser = sequenceOf([str('abc'), endOfInput])
    const result = parser.run('abcxyz')
    assertIsError(result)
    expect(result).toStrictEqual({
      isError: true,
      error: `ParseError @ index 3 -> endOfInput: Expected end of input, but got 'x'`,
      index: 3,
    })
  })

  it('should fail if there is additional binary data', () => {
    const parser = sequenceOf([str('abc'), endOfInput])
    const result = parser.run(new Uint8Array([97, 98, 99, 120, 121, 122])) // equivalent to "abcxyz"

    assertIsError(result)
    expect(result).toStrictEqual({
      isError: true,
      error: `ParseError @ index 3 -> endOfInput: Expected end of input, but got '0x78'`,
      index: 3,
    })
  })
})
