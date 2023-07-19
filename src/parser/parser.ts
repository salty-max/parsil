import { InputType, InputTypes } from '../input-types'
import { encoder } from '../util'

/**
 * Defines the internal structure of the parser result
 * @template T The result type
 * @template E The error type
 */
export type InternalResultType<T, E> = {
  isError: boolean
  error: E
  index: number
  result: T
}

/**
 * ParserState represents the state of the parser.
 * @template T The type of the result
 * @template E The type of the error
 */
export type ParserState<T, E> = {
  dataView: DataView
  inputType: InputType
} & InternalResultType<T, E>

/**
 * StateTransformerFn is a function type used to transform one parser state into another.
 * @template T The type of the result
 * @template E The type of the error, defaults to 'any'
 */
export type StateTransformerFn<T, E = any> = (
  state: ParserState<any, any>
) => ParserState<T, E>

/**
 * ResultType represents a type that is either an error or a success.
 * @template T The result type
 * @template E The error type
 */
export type ResultType<T, E> = Err<E> | Ok<T>

/**
 * Represents an error in parsing.
 * @template E The error type
 */
export type Err<E> = {
  isError: true
  error: E
  index: number
}

/**
 * Represents a successful parse result.
 * @template T The result type
 */
export type Ok<T> = {
  isError: false
  result: T
  index: number
}

export function isOk<T, E>(result: ResultType<T, E>): result is Ok<T> {
  return !result.isError
}

export function isError<T, E>(result: ResultType<T, E>): result is Err<E> {
  return result.isError
}

const createParserState = (
  target: InputType
): ParserState<null, string | null> => {
  let dataView: DataView
  let inputType

  if (typeof target === 'string') {
    const bytes = encoder.encode(target)
    dataView = new DataView(bytes.buffer)
    inputType = InputTypes.STRING
  } else {
    throw new Error(
      `Cannot process input. Must be a string. Got ${typeof target}`
    )
  }

  return {
    dataView,
    inputType,
    isError: false,
    error: null,
    result: null,
    index: 0,
  }
}

/**
 * Represents a parser which transforms input data to the required structure
 * @template T The result type
 * @template E The error type
 */
export class Parser<T, E = string> {
  p: StateTransformerFn<T, E> // The state transformer function for this parser.

  /**
   * Constructs a parser instance using a parser state transformer function.
   * @param parserStateTransformerFn The state transformer function for the parser.
   */
  constructor(p: StateTransformerFn<T, E>) {
    this.p = p
  }

  /**
   * Starts the parsing process on an input, initializing the state, and applying the transformer function.
   * @param target The input to be parsed.
   * @returns The resulting parser state.
   */
  run(target: InputType): ResultType<T, E> {
    const initialState = createParserState(target)
    const resultState = this.p(initialState)

    if (resultState.isError) {
      return {
        isError: true,
        error: resultState.error,
        index: resultState.index,
      }
    }

    return {
      isError: false,
      result: resultState.result,
      index: resultState.index,
    }
  }

  /**
   * Transforms the parser into a new parser that applies a function to the result of the original parser.
   * @param fn A function that takes a result of type T and returns a result of type T2.
   * @returns A new Parser instance that applies the function `fn` to the result.
   */
  map<T2>(fn: (oldRes: T) => T2): Parser<T2, E> {
    return new Parser((state): ParserState<T2, E> => {
      const newState = this.p(state)

      if (newState.isError) return newState as unknown as ParserState<T2, E>

      return updateResult(newState, fn(newState.result))
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
  errorMap<E2>(fn: (error: Err<E>) => E2): Parser<T, E2> {
    return new Parser((state): ParserState<T, E2> => {
      const nextState = this.p(state)
      if (!nextState.isError) return nextState as unknown as ParserState<T, E2>

      return updateError(
        nextState,
        fn({
          isError: true,
          error: nextState.error,
          index: nextState.index,
        })
      )
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
export const updateState = <T, E, T2>(
  state: ParserState<T, E>,
  index: number,
  result: T2
): ParserState<T2, E> => ({
  ...state,
  index,
  result,
})

/**
 * Updates the state of the parser with a new result.
 * @param state The previous state of the parser.
 * @param result The new parsing result.
 * @returns A new parser state with updated result.
 */
export const updateResult = <T, E, T2>(
  state: ParserState<T, E>,
  result: T2
): ParserState<T2, E> => ({
  ...state,
  result,
})

/**
 * Updates the state of the parser with an error.
 * @param state The previous state of the parser.
 * @param errorMsg The error message.
 * @returns A new parser state with updated error information.
 */
export const updateError = <T, E, E2>(
  state: ParserState<T, E>,
  error: E2
): ParserState<T, E2> => ({
  ...state,
  isError: true,
  error,
})
