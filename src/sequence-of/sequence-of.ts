import { Parser, ParserState, updateParserResult } from '../parser'

export const sequenceOf = (parsers: Array<Parser>): Parser =>
  new Parser((state: ParserState): ParserState => {
    if (state.isError) return state

    const results = []
    let nextState = state

    for (const p of parsers) {
      nextState = p.parserStateTransformerFn(nextState)
      const result = nextState.isError ? null : nextState.result
      results.push(result)
    }

    return updateParserResult(nextState, results)
  })
