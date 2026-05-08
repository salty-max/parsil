import { char, digits, endBy, endByOne } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('endBy', () => {
  it('matches values each followed by a separator', () => {
    const r = endBy(char(';'))(digits).run('1;2;3;')
    assertIsOk(r)
    expect(r.result).toEqual(['1', '2', '3'])
    expect(r.index).toBe(6)
  })

  it('fails when last value lacks terminator', () => {
    const r = endBy(char(';'))(digits).run('1;2;3')
    assertIsError(r)
  })

  it('matches empty input as []', () => {
    const r = endBy(char(';'))(digits).run('')
    assertIsOk(r)
    expect(r.result).toEqual([])
  })
})

describe('endByOne', () => {
  it('requires at least one terminated value', () => {
    const r = endByOne(char(';'))(digits).run('')
    assertIsError(r)
    expect(r.error.parser).toBe('endByOne')
  })

  it('accepts a single terminated value', () => {
    const r = endByOne(char(';'))(digits).run('42;')
    assertIsOk(r)
    expect(r.result).toEqual(['42'])
  })
})
