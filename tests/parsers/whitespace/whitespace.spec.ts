import { describe, expect, it } from 'bun:test'
import { whitespace } from '../../../src'

describe('whitespace', () => {
  it('should match whitespace characters', () => {
    const input = '  \t\n'
    const result = whitespace.run(input)

    expect(result).toStrictEqual({
      isError: false,
      result: '  \t\n',
      index: 4,
    })
  })

  it('should fail if no whitespace is found', () => {
    const input = 'abc'
    const result = whitespace.run(input)

    expect(result).toStrictEqual({
      isError: true,
      error: `ParseError @ index 0 -> regex: Tried to match /^\\s+/, got 'abc...'`,
      index: 0,
    })
  })
})
