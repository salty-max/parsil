import { choice, digits, letters, sequenceOf, str } from '@parsil'
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

  it('surfaces the furthest-progress branch in the failure message', () => {
    // Two branches that fail at different depths:
    // - 'he' + 'llo!' consumes 'he' (advancing to index 2) then fails
    //   on the next sub-parser, reporting the failure at index 2.
    // - 'xy' fails at index 0 without advancing.
    // Furthest-progress should win: choice's message reports the
    // index-2 branch failure, not the shallow index-0 one.
    const branchA = sequenceOf([str('he'), str('llo!')])
    const branchB = str('xy')
    const parser = choice([branchA, branchB])
    const result = parser.run('hello')

    assertIsError(result)
    expect(result.error.parser).toBe('choice')
    expect(result.error.message).toContain('furthest branch failed at index 2')
  })
})
