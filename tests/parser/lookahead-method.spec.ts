import { sequenceOf, str } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../util/test-util'

// Regression: Parser.lookahead() must not advance the cursor in
// either branch (success or failure). A consumed-then-failed inner
// parser previously leaked its advance through the method form,
// even though the standalone `lookAhead` parser preserved the
// original cursor.
describe('Parser.lookahead() — cursor preservation', () => {
  it('does not advance on success', () => {
    const parser = sequenceOf([str('hello').lookahead(), str('hello')])
    const r = parser.run('hello world')
    assertIsOk(r)
    // First slot is the lookahead — same value as the second, but the
    // second still found 'hello' at index 0 because the lookahead
    // didn't advance.
    expect(r.result).toEqual(['hello', 'hello'])
    expect(r.index).toBe(5)
  })

  it('does not advance on failure either', () => {
    // sequenceOf([str('he'), str('llo!')]) consumes 'he' (advance 2)
    // before failing on 'llo!'. Wrapped in `.lookahead()`, the failure
    // must restore the cursor to 0 so the surrounding error reports
    // the original position, not the inner advance point.
    const inner = sequenceOf([str('he'), str('llo!')])
    const parser = inner.lookahead()
    const r = parser.run('hello world')
    assertIsError(r)
    expect(r.index).toBe(0)
  })
})
