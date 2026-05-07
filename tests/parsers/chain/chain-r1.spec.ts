import { chainr1, char, digits } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

const num = digits.map((s) => Number(s))

const pow = char('^').map(() => (a: number, b: number) => a ** b)

describe('chainr1', () => {
  it('returns the operand alone when no operator follows', () => {
    const expr = chainr1(num, pow)
    const result = expr.run('5')

    assertIsOk(result)
    expect(result.result).toBe(5)
  })

  it('folds right over a non-associative operator', () => {
    // 2 ^ (3 ^ 2) = 2 ^ 9 = 512
    // (would be 64 = 8^2 if left-folded)
    const expr = chainr1(num, pow)
    const result = expr.run('2^3^2')

    assertIsOk(result)
    expect(result.result).toBe(512)
  })

  it('handles a longer right-fold', () => {
    // 2 ^ (2 ^ (2 ^ 2)) = 2 ^ (2 ^ 4) = 2 ^ 16 = 65536
    const expr = chainr1(num, pow)
    const result = expr.run('2^2^2^2')

    assertIsOk(result)
    expect(result.result).toBe(65536)
  })

  it('demonstrates right-association concretely with an asymmetric operator', () => {
    // append: (a, b) => a*10 + b
    // Right-fold of [1, 2, 3] = (1, (2, 3)) = (1, 23) = 1*10 + 23 = 33
    // Left-fold would be ((1, 2), 3) = (12, 3) = 12*10 + 3 = 123
    const append = char(':').map(() => (a: number, b: number) => a * 10 + b)
    const expr = chainr1(num, append)
    const result = expr.run('1:2:3')

    assertIsOk(result)
    expect(result.result).toBe(33)
  })

  it('fails when the first operand fails', () => {
    const expr = chainr1(num, pow)
    const result = expr.run('xyz')

    assertIsError(result)
  })

  it('fails when an operator is followed by no operand', () => {
    const expr = chainr1(num, pow)
    const result = expr.run('2^3^')

    assertIsError(result)
  })

  it('does not consume a trailing non-operator', () => {
    const expr = chainr1(num, pow)
    const result = expr.run('2^3 rest')

    assertIsOk(result)
    expect(result.result).toBe(8)
    expect(result.index).toBe(3)
  })
})
