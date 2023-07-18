interface ParserState {
  targetString: string
  index: number
  result: unknown | Array<unknown> | null
  error: string | null
  isError: boolean
}

type Parser = (parserState: ParserState) => ParserState

const updateParserState = (
  oldState: ParserState,
  index: number,
  result: ParserState['result']
) => ({
  ...oldState,
  index,
  result,
})

const updateParserResult = (
  oldState: ParserState,
  result: ParserState['result']
) => ({
  ...oldState,
  result,
})

const updateParserError = (oldState: ParserState, errorMsg: string) => ({
  ...oldState,
  isError: true,
  error: errorMsg,
})

const str =
  (s: string): Parser =>
  (state: ParserState): ParserState => {
    const { targetString, index, isError } = state

    if (isError) return state

    const slicedTarget = targetString.slice(index)

    if (slicedTarget.length === 0) {
      return updateParserError(
        state,
        `str: Tried to match ${s} but got unexpected end of input`
      )
    }

    if (slicedTarget.startsWith(s)) {
      return updateParserState(state, index + s.length, s)
    }

    return updateParserError(
      state,
      `str: Tried to match ${s}, but got ${targetString.slice(
        index,
        index + targetString.length
      )}`
    )
  }

const sequenceOf =
  (parsers: Array<Parser>): Parser =>
  (state: ParserState): ParserState => {
    if (state.isError) return state

    const results = []
    let nextState = state

    for (const p of parsers) {
      nextState = p(nextState)
      results.push(nextState.result)
    }

    return updateParserResult(state, results)
  }

const run = (parser: Parser, targetString: string) => {
  const initialState = {
    targetString,
    index: 0,
    result: null,
    error: null,
    isError: false,
  }

  return parser(initialState)
}

const parser = sequenceOf([str('hello'), str('world')])

console.log(run(parser, ''))
