import { describe, expect, it } from 'bun:test'
import { everyCharUntil, str } from '../../../src'
import { assertIsError, assertIsOk } from '../../util/test-util'

describe('everyCharUntil', () => {
  it('should successfully parse until the marker string is found', () => {
    const parser = everyCharUntil(str('end'))
    const result = parser.run('123end456')

    assertIsOk(result)

    expect(result).toStrictEqual({
      isError: false,
      result: '123', // "123" is before "end"
      index: 3,
    })
  })

  it('should fail if the input stream is fully consumed before the marker is found', () => {
    const parser = everyCharUntil(str('end'))
    const result = parser.run('123456')

    assertIsError(result)
    expect(result).toStrictEqual({
      isError: true,
      error: `ParseError @ index 6 -> everythingUntil: Unexpected end of input`,
      index: 6,
    })
  })

  it('should correctly handle binary data', () => {
    const parser = everyCharUntil(str('end'))
    const result = parser.run(
      new Uint8Array([49, 50, 51, 101, 110, 100, 52, 53, 54])
    ) // equivalent to "123end456"

    assertIsOk(result)
    expect(result).toStrictEqual({
      isError: false,
      result: '123', // "123" is before "end"
      index: 3,
    })
  })
})
