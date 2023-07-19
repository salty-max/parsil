import { assertIsError, assertIsOk } from '../../util'
import { str } from '../str'
import { manyOne } from './many-one'

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
      `ParseError (position: 0): Unable to match any input using parser`
    )
  })

  it('should stop parsing when the parser fails', () => {
    const parser = manyOne(str('foo'))
    const result = parser.run('foobarfoo')

    assertIsOk(result)
    expect(result.result).toStrictEqual(['foo'])
  })
})
