import {
  forward,
  parseError,
  Parser,
  updateError,
  updateResult,
} from '@parsil/parser'

/**
 * Parse one or more `operand`s separated by `op`, right-associative.
 * Returns the result of folding `op` over the operands right-to-left.
 *
 * Use this for binary operators that group to the right, like
 * exponentiation in mathematics or the cons operator in many
 * functional languages.
 *
 * If `op` succeeds but the following `operand` fails, the whole parser
 * fails — a trailing operator without an operand is treated as
 * malformed input, not a soft cut.
 *
 * @example
 * const num = digits.map(Number)
 * const pow = char('^').map(() => (a: number, b: number) => a ** b)
 * const expr = chainr1(num, pow)
 * expr.run('2^3^2')  // 2 ^ (3 ^ 2) = 2 ^ 9 = 512
 *
 * @param operand Parser for the operands.
 * @param op Parser that yields a binary function combining two operands.
 * @returns A parser that succeeds with the right-folded result.
 */
export const chainr1 = <T>(
  operand: Parser<T>,
  op: Parser<(left: T, right: T) => T>
): Parser<T> =>
  new Parser<T>((state) => {
    if (state.isError) return forward(state)

    const firstState = operand.p(state)
    if (firstState.isError) return forward(firstState)

    const operands: T[] = [firstState.result]
    const fns: Array<(left: T, right: T) => T> = []
    let cursor = firstState

    while (true) {
      const startIdx = cursor.index

      const opState = op.p(cursor)
      if (opState.isError) break

      const rightState = operand.p(opState)
      if (rightState.isError) return forward(rightState)

      fns.push(opState.result)
      operands.push(rightState.result)
      cursor = rightState

      // Infinite-loop guard: see chainl1 for rationale.
      if (cursor.index === startIdx) {
        return updateError(
          state,
          parseError(
            'chainr1',
            state.index,
            'operator and operand parsers both succeeded without consuming input — infinite loop guard. Ensure at least one of them advances on success.'
          )
        )
      }
    }

    let result: T = operands[operands.length - 1]
    for (let i = fns.length - 1; i >= 0; i--) {
      result = fns[i](operands[i], result)
    }

    return updateResult(cursor, result)
  })
