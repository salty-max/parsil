import { Parser, updateResult } from '@parsil/parser'

/**
 * Parse one or more `operand`s separated by `op`, left-associative.
 * Returns the result of folding `op` over the operands left-to-right.
 *
 * Use this for binary operators that group to the left, like
 * subtraction, division, or function application.
 *
 * If `op` succeeds but the following `operand` fails, the whole parser
 * fails — a trailing operator without an operand is treated as
 * malformed input, not a soft cut.
 *
 * @example
 * const num = digits.map(Number)
 * const sub = char('-').map(() => (a: number, b: number) => a - b)
 * const expr = chainl1(num, sub)
 * expr.run('1-2-3')  // (1 - 2) - 3 = -4
 *
 * @param operand Parser for the operands.
 * @param op Parser that yields a binary function combining two operands.
 * @returns A parser that succeeds with the left-folded result.
 */
export const chainl1 = <T>(
  operand: Parser<T>,
  op: Parser<(left: T, right: T) => T>
): Parser<T> =>
  new Parser<T>((state) => {
    if (state.isError) return state

    const firstState = operand.p(state)
    if (firstState.isError) return firstState

    let acc: T = firstState.result
    let cursor = firstState

    while (true) {
      const opState = op.p(cursor)
      if (opState.isError) break

      const rightState = operand.p(opState)
      if (rightState.isError) return rightState

      acc = opState.result(acc, rightState.result)
      cursor = updateResult(rightState, acc)
    }

    return updateResult(cursor, acc)
  })
