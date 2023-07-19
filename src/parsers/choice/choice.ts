import { Parser, ParserState, updateError } from '../../parser'

/**
 * Tries to parse input with the first parser in a list that succeeds.
 * If all parsers fail, it fails with the last and furthest error.
 *
 * @param parsers An array of parsers to apply to the input.
 * @throws Error If the parsers array is empty.
 * @returns A new Parser instance that will try each parser in order until one succeeds.
 */
export const choice = (parsers: Array<Parser<any>>): Parser<any> => {
  if (parsers.length === 0)
    throw new Error('choice requires a non-empty list of parsers')

  return new Parser((state): ParserState<any, string> => {
    if (state.isError) return state

    for (const p of parsers) {
      const out = p.p(state)
      if (!out.isError) return out
    }

    return updateError(
      state,
      `ParseError (position: ${state.index}): Unable to match with any parser`
    )
  })
}
