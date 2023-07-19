import { sequenceOf } from './sequence-of'
import { str } from '../str'
import { assertIsError, assertIsOk } from '../../util'

describe('sequenceOf', () => {
  it('should match sequence of parsers', () => {
    const parser = sequenceOf([str('Hello'), str('World')])
    const result = parser.run('HelloWorld')

    assertIsOk(result)
    expect(result.result).toStrictEqual(['Hello', 'World'])
  })

  it('should return an error if any parser in sequence fails', () => {
    const parser = sequenceOf([str('Hello'), str('World')])
    const failResult = parser.run('Hello, World')

    assertIsError(failResult)
    expect(failResult.error).toBeDefined()
  })
})
