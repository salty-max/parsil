import { lookAhead, sequenceOf, str } from '../..'
import { assertIsError, assertIsOk } from '../../util'

describe('lookAhead', () => {
  it('should run the given parser without consuming the input', () => {
    const parser = sequenceOf([
      str('hello '),
      lookAhead(str('world')),
      str('world'),
    ])
    const result = parser.run('hello world')

    assertIsOk(result)
    expect(result).toStrictEqual({
      isError: false,
      result: ['hello ', 'world', 'world'],
      index: 11,
    })
  })

  it('should fail if the given parser fails', () => {
    const parser = sequenceOf([
      str('hello '),
      lookAhead(str('world')),
      str('world'),
    ])
    const result = parser.run('hello there')

    assertIsError(result)
    expect(result).toStrictEqual({
      isError: true,
      error: `ParseError @ index 6 -> str: Tried to match 'world', but got 'there...'`,
      index: 6,
    })
  })
})
