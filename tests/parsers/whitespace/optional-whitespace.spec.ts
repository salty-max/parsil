import { describe, expect, it } from 'bun:test'
import { optionalWhitespace } from '../../../src'

describe('optionalWhitespace', () => {
  it('should match whitespace characters', () => {
    const input = '  \t\n'
    const result = optionalWhitespace.run(input)

    expect(result).toStrictEqual({
      isError: false,
      result: '  \t\n',
      index: 4,
    })
  })

  it('should return null if no whitespace is found', () => {
    const input = 'abc'
    const result = optionalWhitespace.run(input)

    expect(result).toStrictEqual({
      isError: false,
      result: '',
      index: 0,
    })
  })
})
