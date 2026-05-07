import { digit } from '@parsil'
import { describe, expect, it } from 'bun:test'

describe('digit', () => {
  it('should parse a single digit', () => {
    const input = '1'
    const result = digit.run(input)

    expect(result).toStrictEqual({
      isError: false,
      result: '1',
      index: 1,
    })
  })

  it('should fail when input is not a digit', () => {
    const input = 'a'
    const result = digit.run(input)

    expect(result).toStrictEqual({
      isError: true,
      error: expect.objectContaining({
        parser: 'digit',
        index: 0,
        message: "Expected digit, but got 'a'",
      }),
      index: 0,
    })
  })

  it('should fail when input is empty', () => {
    const input = ''
    const result = digit.run(input)

    expect(result).toStrictEqual({
      isError: true,
      error: expect.objectContaining({
        parser: 'digit',
        index: 0,
        message: 'Expected digit, but got end of input.',
      }),
      index: 0,
    })
  })
})
