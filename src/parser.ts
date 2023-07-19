export interface ParserState {
  targetString: string
  index: number
  result: unknown | Array<unknown> | null
  error: string | null
  isError: boolean
}

type ParserStateTransformerFn = (parserState: ParserState) => ParserState

export class Parser {
  parserStateTransformerFn: ParserStateTransformerFn

  constructor(parserStateTransformerFn: ParserStateTransformerFn) {
    this.parserStateTransformerFn = parserStateTransformerFn
  }

  run(targetString: string) {
    const initialState = {
      targetString,
      index: 0,
      result: null,
      error: null,
      isError: false,
    }

    return this.parserStateTransformerFn(initialState)
  }
}

export const updateParserState = (
  oldState: ParserState,
  index: number,
  result: ParserState['result']
): ParserState => ({
  ...oldState,
  index,
  result,
})

export const updateParserResult = (
  oldState: ParserState,
  result: ParserState['result']
): ParserState => ({
  ...oldState,
  result,
})

export const updateParserError = (
  oldState: ParserState,
  errorMsg: string
): ParserState => ({
  ...oldState,
  isError: true,
  error: errorMsg,
})
