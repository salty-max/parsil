import { describe, expect, it } from 'bun:test'
import { letter } from '../../../src'

describe('letter', () => {
  it('should parse a single letter', () => {
    const input = 'a'
    const result = letter.run(input)

    expect(result).toStrictEqual({
      isError: false,
      result: 'a',
      index: 1,
    })
  })

  it('should fail when input is not a letter', () => {
    const input = '1'
    const result = letter.run(input)

    expect(result).toStrictEqual({
      isError: true,
      error: "ParseError @ index 0 -> letter: Expected letter, but got '1'",
      index: 0,
    })
  })

  it('should fail when input is empty', () => {
    const input = ''
    const result = letter.run(input)

    expect(result).toStrictEqual({
      isError: true,
      error:
        'ParseError @ index 0 -> letter: Expected letter, but got end of input.',
      index: 0,
    })
  })
})
