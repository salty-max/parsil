import { char, digits, sepEndBy, sepEndByOne } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('sepEndBy', () => {
  it('matches values without trailing separator', () => {
    const r = sepEndBy(char(','))(digits).run('1,2,3')
    assertIsOk(r)
    expect(r.result).toEqual(['1', '2', '3'])
    expect(r.index).toBe(5)
  })

  it('matches values with trailing separator', () => {
    const r = sepEndBy(char(','))(digits).run('1,2,3,')
    assertIsOk(r)
    expect(r.result).toEqual(['1', '2', '3'])
    expect(r.index).toBe(6)
  })

  it('matches a single value', () => {
    const r = sepEndBy(char(','))(digits).run('42')
    assertIsOk(r)
    expect(r.result).toEqual(['42'])
  })

  it('matches empty input', () => {
    const r = sepEndBy(char(','))(digits).run('')
    assertIsOk(r)
    expect(r.result).toEqual([])
  })
})

describe('sepEndByOne', () => {
  it('requires at least one value', () => {
    const r = sepEndByOne(char(','))(digits).run('')
    assertIsError(r)
    expect(r.error.parser).toBe('sepEndByOne')
  })

  it('accepts trailing separator on a single value', () => {
    const r = sepEndByOne(char(','))(digits).run('42,')
    assertIsOk(r)
    expect(r.result).toEqual(['42'])
  })
})
