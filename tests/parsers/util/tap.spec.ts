import { digits, tap } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('tap', () => {
  it('invokes fn exactly once on success', () => {
    let calls = 0
    const seen: unknown[] = []
    const wrapped = tap<string>((value) => {
      calls++
      seen.push(value)
    })(digits)

    const r = wrapped.run('42')
    assertIsOk(r)
    expect(r.result).toBe('42')
    expect(calls).toBe(1)
    expect(seen).toEqual(['42'])
  })

  it('does not invoke fn on failure', () => {
    let calls = 0
    const wrapped = tap<string>(() => {
      calls++
    })(digits)

    const r = wrapped.run('abc')
    assertIsError(r)
    expect(calls).toBe(0)
  })

  it('forwards the result unchanged', () => {
    const wrapped = tap<string>(() => undefined)(digits)
    const r = wrapped.run('123')
    assertIsOk(r)
    expect(r.result).toBe('123')
    expect(r.index).toBe(3)
  })

  it('exposes post-parse state to fn', () => {
    let receivedIndex = -1
    const wrapped = tap<string>((_, state) => {
      receivedIndex = state.index
    })(digits)

    wrapped.run('42xy')
    expect(receivedIndex).toBe(2)
  })
})
