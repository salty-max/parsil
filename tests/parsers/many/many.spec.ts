import { describe, expect, it } from 'bun:test'
import { many, str } from '../../../src'
import { assertIsOk } from '../../util/test-util'

describe('many', () => {
  it('should return an array of results', () => {
    const parser = many(str('foo'))
    const result = parser.run('foofoofoofoofoo')

    assertIsOk(result)
    expect(result.result).toStrictEqual(['foo', 'foo', 'foo', 'foo', 'foo'])
  })

  it('should return an empty array if no match are found', () => {
    const parser = many(str('foo'))
    const result = parser.run('barbar')

    assertIsOk(result)
    expect(result.result).toStrictEqual([])
  })

  it('should stop parsing when the parser fails', () => {
    const parser = many(str('foo'))
    const result = parser.run('foobarfoo')

    assertIsOk(result)
    expect(result.result).toStrictEqual(['foo'])
  })
})
