import { InputType } from '../input-types'

/**
 * Interface representing the state of the parser.
 * It contains the input target to be parsed, the current index,
 * the result of the parsing (or null if not done yet), and potential errors.
 */
export interface ParserState<T> {
  target: InputType // The input to parse.
  index: number // The current index in the input.
  result: T | null // The result of parsing.
  error: string | null // Any error message from the parser.
  isError: boolean // Whether or not the parser encountered an error.
}

/**
 * The function type used to transform one parser state into another.
 * It takes a parser state with a result of type T and returns a state with a result of type U.
 */
export type ParserStateTransformerFn<T, U = T> = (
  parserState: ParserState<T>
) => ParserState<U>

/**
 * Main Parser class, represents a parser with a state transformation function.
 */
export class Parser<T> {
  parserStateTransformerFn: ParserStateTransformerFn<T> // The state transformer function for this parser.

  /**
   * Constructs a parser instance using a parser state transformer function.
   * @param parserStateTransformerFn The state transformer function for the parser.
   */
  constructor(parserStateTransformerFn: ParserStateTransformerFn<T>) {
    this.parserStateTransformerFn = parserStateTransformerFn
  }

  /**
   * Starts the parsing process on an input, initializing the state, and applying the transformer function.
   * @param target The input to be parsed.
   * @returns The resulting parser state.
   */
  run(target: InputType) {
    const initialState: ParserState<T> = {
      target,
      index: 0,
      result: null,
      error: null,
      isError: false,
    }

    return this.parserStateTransformerFn(initialState)
  }

  /**
   * Transforms the parser into a new parser that applies a function to the result of the original parser.
   * @param fn A function that takes a result of type T and returns a result of type U.
   * @returns A new Parser instance that applies the function `fn` to the result.
   */
  map<U>(fn: (result: T) => U): Parser<U> {
    return new Parser<U>((state: ParserState<U>) => {
      const nextState = this.parserStateTransformerFn(
        state as unknown as ParserState<T>
      )

      if (nextState.isError) return nextState as unknown as ParserState<U>

      if (nextState.result !== null) {
        return updateParserResult(nextState, fn(nextState.result))
      }

      throw new Error('map: Cannot process a null result')
    })
  }

  /**
   * Transforms the parser into a new parser which applies a function `fn`
   * to the error message and index of the original parser when it encounters an error.
   *
   * @param fn - This is a function that takes error message and index as inputs and returns a string.
   * It is used to transform the error message in case the parsing fails.
   *
   * @returns - It returns a new Parser. The state transformer function of this new parser
   * first applies the original parser's state transformer function and then,
   * if there was an error, it updates the error message using the `fn` function.
   */
  errorMap(fn: (error: string, index: number) => string): Parser<T> {
    return new Parser<T>((state: ParserState<T>) => {
      const nextState = this.parserStateTransformerFn(state)

      if (!nextState.isError) return nextState

      return updateParserError(nextState, fn(nextState.error!, nextState.index))
    })
  }
}

/**
 * Updates the state of the parser with a new index and result.
 * @param oldState The previous state of the parser.
 * @param index The new index in the input.
 * @param result The new parsing result.
 * @returns A new parser state with updated index and result.
 */
export const updateParserState = <T, U = T>(
  oldState: ParserState<T>,
  index: number,
  result: U
): ParserState<U> => ({
  ...oldState,
  index,
  result,
})

/**
 * Updates the state of the parser with a new result.
 * @param oldState The previous state of the parser.
 * @param result The new parsing result.
 * @returns A new parser state with updated result.
 */
export const updateParserResult = <T, U = T>(
  oldState: ParserState<T>,
  result: U
): ParserState<U> => ({
  ...oldState,
  result,
})

/**
 * Updates the state of the parser with an error.
 * @param oldState The previous state of the parser.
 * @param errorMsg The error message.
 * @returns A new parser state with updated error information.
 */
export const updateParserError = <T>(
  oldState: ParserState<T>,
  errorMsg: string
): ParserState<T> => ({
  ...oldState,
  isError: true,
  error: errorMsg,
})
