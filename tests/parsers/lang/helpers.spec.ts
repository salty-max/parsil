import {
  apply,
  char,
  digits,
  expect as expectP,
  identifier,
  intLit,
  label,
  letters,
  tag,
  tok,
} from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('label', () => {
  it('replaces the error with "Expected <name>"', () => {
    const num = label('a number', digits.map(Number))
    const r = num.run('xyz')

    assertIsError(r)
    expect(r.error.parser).toBe('label')
    expect(r.error.expected).toBe('a number')
    expect(r.error.message).toBe('Expected a number')
  })

  it('passes through on success', () => {
    const num = label('a number', digits.map(Number))
    const r = num.run('42')
    assertIsOk(r)
    expect(r.result).toBe(42)
  })
})

describe('expect', () => {
  it('replaces the error message but keeps parser identity', () => {
    const port = expectP(intLit, 'a port number (0-65535)')
    const r = port.run('foo')

    assertIsError(r)
    expect(r.error.message).toBe('a port number (0-65535)')
    expect(r.error.parser).toBe('intLit')
  })
})

describe('tag', () => {
  it('replaces the result with a constant', () => {
    const trueP = tag(true)(letters)
    const r = trueP.run('true rest')
    assertIsOk(r)
    expect(r.result).toBe(true)
  })
})

describe('apply', () => {
  it('combines two parsers via a function (arity 2)', () => {
    const eq = tok(char('='))
    const assign = apply(identifier, eq, intLit, (name, _, value) => ({
      name,
      value,
    }))
    const r = assign.run('age=42')
    assertIsOk(r)
    expect(r.result).toEqual({ name: 'age', value: 42 })
  })

  it('combines three parsers (arity 3)', () => {
    const triple = apply(
      letters,
      digits.map(Number),
      letters,
      (a, b, c) => `${a}-${b}-${c}`
    )
    const r = triple.run('foo42bar')
    assertIsOk(r)
    expect(r.result).toBe('foo-42-bar')
  })

  it('propagates inner failure', () => {
    const p = apply(letters, digits, (l, d) => `${l}+${d}`)
    const r = p.run('foo')
    assertIsError(r)
  })
})
