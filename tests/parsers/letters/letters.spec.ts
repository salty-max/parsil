import { describe, expect, it } from 'bun:test'
import { letters } from '../../../src'

describe('letters', () => {
  it('should correctly parse letters from the string', () => {
    const res = letters.run('abcd123')

    expect(res).toEqual({
      index: 4,
      result: 'abcd',
      isError: false,
    })
  })

  it('should return an error when the input does not start with letters', () => {
    const res = letters.run('123abcd')

    expect(res).toEqual({
      index: 0,
      isError: true,
      error: 'ParseError @ index 0 -> letters: Expected letters',
    })
  })

  it('should return an error when the input string is empty', () => {
    const res = letters.run('')

    expect(res).toEqual({
      index: 0,
      isError: true,
      error: 'ParseError @ index 0 -> letters: Expected letters',
    })
  })
})
