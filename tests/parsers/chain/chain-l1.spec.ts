import { chainl1, char, choice, digits, possibly } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

const num = digits.map((s) => Number(s))

const sub = char('-').map(() => (a: number, b: number) => a - b)
const add = char('+').map(() => (a: number, b: number) => a + b)
const mul = char('*').map(() => (a: number, b: number) => a * b)
const addOrSub = choice([add, sub])

describe('chainl1', () => {
  it('returns the operand alone when no operator follows', () => {
    const expr = chainl1(num, sub)
    const result = expr.run('42')

    assertIsOk(result)
    expect(result.result).toBe(42)
  })

  it('folds left over a non-associative operator', () => {
    // Subtraction is non-associative, so the fold direction is observable.
    // Left-fold of `1-2-3` = (1 - 2) - 3 = -4 (would be 2 if right-folded)
    const expr = chainl1(num, sub)
    const result = expr.run('1-2-3')

    assertIsOk(result)
    expect(result.result).toBe(-4)
  })

  it('mixes operators that share a precedence level', () => {
    const expr = chainl1(num, addOrSub)
    const result = expr.run('10+5-3+1')

    assertIsOk(result)
    expect(result.result).toBe(13)
  })

  it('layers with itself to express precedence', () => {
    // term = num (* num)*           — higher precedence, binds tighter
    // expr = term ((+|-) term)*
    const term = chainl1(num, mul)
    const expr = chainl1(term, addOrSub)

    const result = expr.run('2+3*4-1')
    assertIsOk(result)
    // 2 + (3 * 4) - 1 = 13
    expect(result.result).toBe(13)
  })

  it('fails when the first operand fails', () => {
    const expr = chainl1(num, sub)
    const result = expr.run('xyz')

    assertIsError(result)
  })

  it('fails when an operator is followed by no operand', () => {
    const expr = chainl1(num, sub)
    const result = expr.run('1-2-')

    // Trailing '-' starts an op that succeeds, but the operand after
    // it is missing → the chain fails rather than soft-cutting.
    assertIsError(result)
  })

  it('stops at a non-operator character and leaves the cursor positioned for the next parser', () => {
    const expr = chainl1(num, sub)
    const trailing = possibly(char(';'))

    const result = expr.run('1-2;')
    assertIsOk(result)
    expect(result.result).toBe(-1)
    // index should land on ';' so a subsequent parser can resume cleanly
    expect(result.index).toBe(3)

    const tailResult = trailing.run('1-2;'.slice(3))
    assertIsOk(tailResult)
  })
})
