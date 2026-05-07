import { anyChar } from '@parsil'
import { describe, expect, it } from 'bun:test'

describe('char', () => {
  it('should correctly parse the target string', () => {
    const parser = anyChar
    const res = parser.run('@')

    expect(res).toEqual({
      index: 1,
      result: '@',
      isError: false,
    })
  })

  it('should return an error when the input string is empty', () => {
    const parser = anyChar
    const res = parser.run('')

    expect(res).toEqual({
      index: 0,
      isError: true,
      error: expect.objectContaining({
        parser: 'anyChar',
        index: 0,
        message: 'Expected a character, but got unexpected end of input',
      }),
    })
  })
})
