import { choice, digits, letters } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('choice', () => {
  it('should return result of first successful parser', () => {
    const parser = choice([digits, letters])
    const result = parser.run('foo')

    assertIsOk(result)
    expect(result.result).toBe('foo')
  })

  it('should return error if all parsers fail', () => {
    const parser = choice([digits, letters])
    const result = parser.run('@')

    assertIsError(result)
    // choice now aggregates `expected` from each failing branch.
    expect(result.error.parser).toBe('choice')
    expect(result.error.index).toBe(0)
    expect(result.error.message).toContain('Expected one of:')
    expect(result.error.expected).toBe('[0-9]+ | [A-Za-z]+')
  })
})
