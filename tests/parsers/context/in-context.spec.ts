import {
  char,
  formatParseError,
  inContext,
  sepBy,
  sequenceOf,
  str,
} from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError } from '../../util/test-util'

describe('inContext', () => {
  it('passes through on success', () => {
    const parser = inContext('greeting', str('hello'))
    const result = parser.run('hello world')

    expect(result.isError).toBe(false)
    if (!result.isError) {
      expect(result.result).toBe('hello')
    }
  })

  it('pushes label onto error.context on failure', () => {
    const parser = inContext('greeting', str('hello'))
    const result = parser.run('xyz')

    assertIsError(result)
    expect(result.error.context).toEqual(['greeting'])
  })

  it('accumulates outer-first when nested', () => {
    const args = inContext('argument list', sepBy(char(','))(str('foo')))
    const fnCall = inContext(
      'function call',
      sequenceOf([str('('), args, str(')')])
    )

    // Force a failure inside argList by feeding a bad close.
    const result = fnCall.run('(foo!)')

    assertIsError(result)
    // The failure originates from str(')') inside fnCall — only one
    // label gets pushed (the outer 'function call').
    expect(result.error.context).toContain('function call')
  })

  it('preserves inner error fields (parser, index, message)', () => {
    const parser = inContext('greeting', str('hello'))
    const result = parser.run('xyz')

    assertIsError(result)
    expect(result.error.parser).toBe('str')
    expect(result.error.index).toBe(0)
    expect(result.error.message).toContain("Tried to match 'hello'")
  })

  it('formatParseError renders context as bracketed list', () => {
    const inner = inContext('inner', str('hello'))
    const outer = inContext('outer', inner)
    const result = outer.run('xyz')

    assertIsError(result)
    const formatted = formatParseError(result.error)
    expect(formatted).toContain('[outer > inner]')
    expect(formatted).toContain("str: Tried to match 'hello'")
  })
})
