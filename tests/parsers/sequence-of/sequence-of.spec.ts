import { formatParseError, sequenceOf, str } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

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
    expect(formatParseError(failResult.error)).toBeDefined()
  })
})
