import { bytes } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('bytes', () => {
  it('reads exactly n bytes', () => {
    const buf = new Uint8Array([1, 2, 3, 4, 5])
    const r = bytes(3).run(new DataView(buf.buffer))
    assertIsOk(r)
    expect([...r.result]).toEqual([1, 2, 3])
    expect(r.index).toBe(3)
  })

  it('returns a copy decoupled from the source buffer', () => {
    const buf = new Uint8Array([10, 20, 30])
    const r = bytes(3).run(new DataView(buf.buffer))
    assertIsOk(r)
    r.result[0] = 99
    expect(buf[0]).toBe(10)
  })

  it('reads zero bytes as []', () => {
    const buf = new Uint8Array([1, 2])
    const r = bytes(0).run(new DataView(buf.buffer))
    assertIsOk(r)
    expect([...r.result]).toEqual([])
    expect(r.index).toBe(0)
  })

  it('fails on EOI', () => {
    const buf = new Uint8Array([1, 2])
    const r = bytes(5).run(new DataView(buf.buffer))
    assertIsError(r)
    expect(r.error.parser).toBe('bytes')
  })

  it('throws on negative n', () => {
    expect(() => bytes(-1)).toThrow(TypeError)
  })

  it('throws on non-integer n', () => {
    expect(() => bytes(1.5)).toThrow(TypeError)
  })
})
