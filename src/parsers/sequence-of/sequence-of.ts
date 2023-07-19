import { Parser, updateResult } from '../../parser/parser'

/**
 * Creates a new parser that tries to match a sequence of parsers.
 * The resulting parser matches only if all the provided parsers match in the given order.
 * If any parser fails, the resulting parser will also fail.
 *
 * @param parsers - An array of Parser instances that will be matched in sequence.
 * @returns A new Parser instance that matches a sequence of the provided parsers.
 */
export const sequenceOf = (parsers: Array<Parser<any>>): Parser<any> =>
  new Parser((state) => {
    if (state.isError) return state

    const results = []
    let nextState = state

    for (const p of parsers) {
      const out = p.p(nextState)

      if (out.isError) return out

      nextState = out
      results.push(out.result)
    }

    return updateResult(nextState, results)
  })
