import { startOfInput } from './start-of-input'
import { sequenceOf } from '../sequence-of'
import { str } from '../str'
import { assertIsError, assertIsOk } from '../../util'

describe('startOfInput parser', () => {
  it('should successfully parse if the parser is at the start of the input', () => {
    const parser = sequenceOf([startOfInput, str('abc')])
    const result = parser.run('abc')

    assertIsOk(result)

    expect(result).toStrictEqual({
      isError: false,
      result: [null, 'abc'],
      index: 3,
    })
  })

  it('should fail if the parser is not at the start of the input', () => {
    const parser = sequenceOf([str('xyz'), startOfInput, str('abc')])
    const result = parser.run('xyzabc')

    assertIsError(result)

    expect(result).toStrictEqual({
      isError: true,
      error: `ParseError @ index 3 -> startOfInput: Expected start of input`,
      index: 3,
    })
  })
})
