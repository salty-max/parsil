import { identifier } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('identifier', () => {
  it('matches a simple identifier', () => {
    const r = identifier.run('foo')
    assertIsOk(r)
    expect(r.result).toBe('foo')
  })

  it('matches identifiers with digits and underscores', () => {
    const r = identifier.run('foo_bar_42')
    assertIsOk(r)
    expect(r.result).toBe('foo_bar_42')
  })

  it('starts with an underscore', () => {
    const r = identifier.run('_x')
    assertIsOk(r)
    expect(r.result).toBe('_x')
  })

  it('rejects identifiers starting with a digit', () => {
    const r = identifier.run('123foo')
    assertIsError(r)
    expect(r.error.parser).toBe('identifier')
  })

  it('stops at the first non-identifier character', () => {
    const r = identifier.run('foo bar')
    assertIsOk(r)
    expect(r.result).toBe('foo')
    expect(r.index).toBe(3)
  })
})
