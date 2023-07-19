import { digits } from './digits'

describe('digits', () => {
  it('should correctly parse digits from the string', () => {
    const res = digits.run('123abcd')

    expect(res).toEqual({
      index: 3,
      result: '123',
      isError: false,
    })
  })

  it('should return an error when the input does not start with digits', () => {
    const res = digits.run('abcd123')

    expect(res).toEqual({
      index: 0,
      isError: true,
      error: 'ParseError (position: 0): Expected digits',
    })
  })

  it('should return an error when the input string is empty', () => {
    const res = digits.run('')

    expect(res).toEqual({
      index: 0,
      isError: true,
      error: 'ParseError (position: 0): Expected digits',
    })
  })
})
