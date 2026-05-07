import { char, letters, lexeme, sequenceOf, str, tok } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsOk } from '../../util/test-util'

describe('tok', () => {
  it('consumes trailing whitespace and returns the inner result', () => {
    const result = tok(letters).run('foo   ')

    assertIsOk(result)
    expect(result.result).toBe('foo')
    expect(result.index).toBe(6) // 3 letters + 3 spaces
  })

  it('does not fail when no trailing whitespace is present', () => {
    const result = tok(letters).run('foo')

    assertIsOk(result)
    expect(result.result).toBe('foo')
    expect(result.index).toBe(3)
  })

  it('composes cleanly with sequenceOf', () => {
    const lparen = tok(char('('))
    const rparen = tok(char(')'))
    const word = tok(letters)

    const parser = sequenceOf([word, lparen, word, rparen])
    const result = parser.run('foo  (  bar )')

    assertIsOk(result)
    expect(result.result).toEqual(['foo', '(', 'bar', ')'])
    expect(result.index).toBe(13)
  })

  it('handles tabs and newlines as trailing whitespace', () => {
    const result = tok(str('hi')).run('hi\t\n  rest')

    assertIsOk(result)
    expect(result.result).toBe('hi')
    expect(result.index).toBe(6) // 'hi' + tab + newline + 2 spaces
  })

  it('lexeme behaves identically to tok', () => {
    const a = tok(letters).run('foo   bar')
    const b = lexeme(letters).run('foo   bar')
    expect(b).toEqual(a)
  })
})
