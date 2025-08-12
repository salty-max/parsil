import { describe, expect, it } from 'bun:test'
import { manyOne, str } from '../../../src'
import { assertIsError, assertIsOk } from '../../util/test-util'

describe('manyOne', () => {
  it('should return an array of results', () => {
    const parser = manyOne(str('foo'))
    const result = parser.run('foofoofoofoofoo')

    assertIsOk(result)
    expect(result.result).toStrictEqual(['foo', 'foo', 'foo', 'foo', 'foo'])
  })

  it('should return an error if no match are found', () => {
    const parser = manyOne(str('foo'))
    const result = parser.run('barbar')

    assertIsError(result)
    expect(result.error).toBe(
      `ParseError @ index 0 -> manyOne: Expected to match at least one value`
    )
  })

  it('should stop parsing when the parser fails', () => {
    const parser = manyOne(str('foo'))
    const result = parser.run('foobarfoo')

    assertIsOk(result)
    expect(result.result).toStrictEqual(['foo'])
  })
})
