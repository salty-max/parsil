import { describe, it, expect } from 'bun:test'
import { str } from '../../src'
import { assertIsOk } from '../util/test-util'

describe('Parser ▸ withSpan / spanMap', () => {
  it('withSpan returns value and start/end offsets', () => {
    const p = str('foo').withSpan()
    const res = p.run('foobar')
    assertIsOk(res)
    expect(res.result.value).toBe('foo')
    expect(res.result.start).toBe(0)
    expect(res.result.end).toBe(3)
    // parser still consumed input up to end
    expect(res.index).toBe(3)
  })

  it('withSpan across chained parsers covers the whole consumed range', () => {
    const p = str('foo').then(str('bar')).withSpan()
    const res = p.run('foobar!')
    assertIsOk(res)
    // value is from the last parser in then-chain
    expect(res.result.value).toBe('bar')
    expect(res.result.start).toBe(0)
    expect(res.result.end).toBe(6)
    expect(res.index).toBe(6)
  })

  it('spanMap maps value+span into a custom node', () => {
    const p = str('hi').spanMap((v, loc) => ({ kind: 'greet', v, loc }))
    const res = p.run('hi there')
    assertIsOk(res)
    expect(res.result.kind).toBe('greet')
    expect(res.result.v).toBe('hi')
    expect(res.result.loc).toEqual({ start: 0, end: 2 })
    expect(res.index).toBe(2)
  })

  it('withSpan on lookahead has zero-length span (no consumption)', () => {
    const p = str('foo').lookahead().withSpan()
    const res = p.run('foobar')
    assertIsOk(res)
    expect(res.result.value).toBe('foo')
    // lookahead restores index, so span is zero-length
    expect(res.result.start).toBe(0)
    expect(res.result.end).toBe(0)
    expect(res.index).toBe(0)
  })
})
