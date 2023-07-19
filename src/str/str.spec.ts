import { str } from './str'

describe('str', () => {
  it('should succeed when match is found', () => {
    const parser = str('foo')
    const res = parser.run('foo')
    expect(res).toStrictEqual({
      target: 'foo',
      index: 3,
      result: 'foo',
      isError: false,
      error: null,
    })
  })
  it('should update state error when match is not found', () => {
    const parser = str('foo')
    const res = parser.run('bar')
    expect(res).toStrictEqual({
      target: 'bar',
      index: 0,
      result: null,
      isError: true,
      error: `str: Tried to match 'foo', but got 'bar'`,
    })
  })
  it('should update state error when end of input is found instead of match', () => {
    const parser = str('foo')
    const res = parser.run('')
    expect(res).toStrictEqual({
      target: '',
      index: 0,
      result: null,
      isError: true,
      error: `str: Tried to match 'foo', but got unexpected end of input`,
    })
  })
})
