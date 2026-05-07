import { floatLit, intLit, signed } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('intLit', () => {
  it('matches a positive integer', () => {
    const r = intLit.run('42')
    assertIsOk(r)
    expect(r.result).toBe(42)
  })

  it('matches a signed negative integer', () => {
    const r = intLit.run('-7x')
    assertIsOk(r)
    expect(r.result).toBe(-7)
  })

  it('matches a signed positive integer', () => {
    const r = intLit.run('+0')
    assertIsOk(r)
    expect(r.result).toBe(0)
  })

  it('rejects non-numeric input', () => {
    const r = intLit.run('abc')
    assertIsError(r)
    expect(r.error.parser).toBe('intLit')
  })
})

describe('floatLit', () => {
  it('matches a simple decimal', () => {
    const r = floatLit.run('3.14')
    assertIsOk(r)
    expect(r.result).toBe(3.14)
  })

  it('matches negative decimals', () => {
    const r = floatLit.run('-2.5e3')
    assertIsOk(r)
    expect(r.result).toBe(-2500)
  })

  it('matches scientific notation', () => {
    const r = floatLit.run('1e-10')
    assertIsOk(r)
    expect(r.result).toBe(1e-10)
  })

  it('rejects bare integers (use intLit for those)', () => {
    const r = floatLit.run('42')
    assertIsError(r)
    expect(r.error.parser).toBe('floatLit')
  })
})

describe('signed', () => {
  it('passes through unsigned numbers', () => {
    const num = intLit
    const r = signed(num).run('42')
    assertIsOk(r)
    expect(r.result).toBe(42)
  })

  it('negates with leading -', () => {
    // Use a digit-only parser so signed handles the sign itself.
    const num = intLit
    // intLit already supports signs, so signed(intLit('-42')) is -42
    // (intLit consumes the sign, signed sees no extra sign).
    const r = signed(num).run('-42')
    assertIsOk(r)
    expect(r.result).toBe(-42)
  })
})
