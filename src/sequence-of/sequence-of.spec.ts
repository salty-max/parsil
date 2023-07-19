import { str } from '../str/str'
import { sequenceOf } from './sequence-of'

describe('sequenceOf', () => {
  it('parser state should have an array of embedded parsers results as result', () => {
    const parser = sequenceOf([str('foo'), str('bar')])
    const res = parser.run('foobar')

    expect(res).toStrictEqual({
      target: 'foobar',
      index: 6,
      result: ['foo', 'bar'],
      isError: false,
      error: null,
    })
  })
  it('parser should stop parsing if an error is present', () => {
    const parser = sequenceOf([str('foo'), str('bar')])
    const res = parser.run('foo bar')

    expect(res).toStrictEqual({
      target: 'foo bar',
      index: 3,
      result: ['foo', null],
      isError: true,
      error: `str: Tried to match 'bar', but got ' bar'`,
    })
  })
})
