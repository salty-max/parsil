import { letters, possibly } from '@parsil'
import { describe, expect, it } from 'bun:test'

describe('possibly', () => {
  it('should return the result of the parser if successful', () => {
    const input = 'abc'
    const result = possibly(letters).run(input)

    expect(result).toStrictEqual({
      isError: false,
      result: 'abc',
      index: 3,
    })
  })

  it('should return null if the parser fails', () => {
    const input = '123'
    const result = possibly(letters).run(input)

    expect(result).toStrictEqual({
      isError: false,
      result: null,
      index: 0,
    })
  })
})
