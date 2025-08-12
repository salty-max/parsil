import { describe, it, expect } from 'bun:test'
import { anyCharExcept, char } from '../../../src'

describe('anyCharExcept', () => {
  it('should match any character except the ones matched by the given parser', () => {
    const parser = anyCharExcept(char('.'))
    const input = 'This is a sentence.'

    const result = parser.run(input)

    expect(result).toStrictEqual({
      isError: false,
      result: 'T',
      index: 1,
    })
  })

  it('should error when the excluded char is next', () => {
    const parser = anyCharExcept(char('.'))
    const input = '.'

    const result = parser.run(input)

    expect(result).toStrictEqual({
      isError: true,
      error: expect.stringContaining("Matched '.'"),
      index: 0,
    })
  })

  it('should error on EOF', () => {
    const parser = anyCharExcept(char('x'))
    const input = ''

    const result = parser.run(input)

    expect(result).toStrictEqual({
      isError: true,
      error: expect.stringContaining('Unexpected end of input'),
      index: 0,
    })
  })
})
