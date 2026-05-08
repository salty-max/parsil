import { char, lookAhead, many, possibly, succeed } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError } from '../../util/test-util'

// Regression: prior to the audit fix, `many(p)` looped forever when
// `p` succeeded without consuming input (e.g. `possibly(...)` always
// succeeds; if its inner parser fails, the cursor doesn't move).
// Surface as a parse failure with a clear diagnostic instead.
describe('many — infinite-loop guard on no-progress', () => {
  it('fails clean when the inner parser is `possibly(p)` and p never matches', () => {
    const parser = many(possibly(char('z')))
    const r = parser.run('abc')
    assertIsError(r)
    expect(r.error.parser).toBe('many')
    expect(r.error.message).toContain('without consuming input')
  })

  it('fails clean when the inner parser is `succeed(...)`', () => {
    const parser = many(succeed(42))
    const r = parser.run('anything')
    assertIsError(r)
    expect(r.error.parser).toBe('many')
  })

  it('fails clean when the inner parser is `lookAhead(p)`', () => {
    const parser = many(lookAhead(char('a')))
    const r = parser.run('abc')
    assertIsError(r)
    expect(r.error.parser).toBe('many')
  })

  it('still works correctly when the inner parser advances', () => {
    const parser = many(char('a'))
    const r = parser.run('aaab')
    expect(r.isError).toBe(false)
    if (!r.isError) {
      expect(r.result).toEqual(['a', 'a', 'a'])
      expect(r.index).toBe(3)
    }
  })
})
