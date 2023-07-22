import { anyCharExcept } from './any-char-except'
import { char } from './char'

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

  it('should return error is unwanted char is matched', () => {
    const parser = anyCharExcept(char('.'))
    const input = '.'

    const result = parser.run(input)
    expect(result).toStrictEqual({
      isError: true,
      error:
        "ParseError @ index 0 -> anyCharExcept: Matched '.' from the exception parser",
      index: 0,
    })
  })
})
