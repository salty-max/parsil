import { InputType, InputTypes, isTypedArray } from '../input-types'
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
  } else if (target instanceof ArrayBuffer) {
    dataView = new DataView(target)
    inputType = InputTypes.ARRAY_BUFFER
  } else if (isTypedArray(target)) {
    dataView = new DataView(target.buffer)
    inputType = InputTypes.TYPED_ARRAY
  } else if (target instanceof DataView) {
    dataView = target
    inputType = InputTypes.DATA_VIEW
  } else {
    throw new Error(
      `Cannot process input. Must be a string, ArrayBuffer, TypedArray, or DataView. Got ${typeof target}`
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
   * `.run` starts the parsing process on an input, initializing the state, and applying the transformer function.
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
   * `.fork` takes an input to parse, and two functions to handle the results of parsing:
   * an error function that is called when parsing fails, and a success function that is called when parsing is successful.
   * The fork method will run the parser on the input and, depending on the outcome, call the appropriate function.
   *
   * @param target The input to be parsed.
   * @param errorFn A function that is called when parsing fails. It receives the error and the parser state as arguments.
   * @param successFn A function that is called when parsing is successful. It receives the result and the parser state as arguments.
   * @returns The result of calling either the `errorFn` or `successFn`, depending on whether parsing was successful or not.
   */
  fork<F>(
    target: InputType,
    errorFn: (error: E, parsingState: ParserState<T, E>) => F,
    successFn: (result: T, parsingState: ParserState<T, E>) => F
  ) {
    const state = createParserState(target)
    const newState = this.p(state)

    if (newState.isError) {
      return errorFn(newState.error, newState)
    }

    return successFn(newState.result, newState)
  }

  /**
   * `.map` transforms the parser into a new parser that applies a function to the result of the original parser.
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
   * `.chain` transforms the parser into a new parser by applying a function to the result of the original parser.
   * This function should return a new Parser that can be used to parse the next input. This is used
   * for cases where the result of a parser is needed to decide what to parse next.
   *
   * @param fn A function that takes the result of type T from the original parser and returns a new Parser.
   * @returns A new Parser instance that uses the function `fn` to decide what to parse next.
   * This parser is used to parse the remainder of the input after the original parser has consumed its part.
   */
  chain<T2>(fn: (oldRes: T) => Parser<T2, E>): Parser<T2, E> {
    return new Parser((state): ParserState<T2, E> => {
      const nextState = this.p(state)

      if (nextState.isError) return nextState as unknown as ParserState<T2, E>

      return fn(nextState.result).p(nextState)
    })
  }

  /**
   * `.errorMap` transforms the parser into a new parser which applies a function `fn`
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

  /**
   * `.skip` parses `this` and then parses `other`, **keeping the result of `this`** and discarding `other`’s result.
   * This is equivalent to `this.chain(a => other.map(() => a))`.
   *
   * Use this to require a trailing delimiter (e.g., “instruction then newline”), or to parse wrappers and keep only the inner value.
   *
   * Backtracking: if `other` fails, the whole `.skip` fails. Any input consumed by `this` remains consumed (i.e., this “commits” to `this`).
   *
   * @param other The parser to run after `this`, whose result will be discarded.
   * @returns A parser that yields the result of `this` if both succeed.
   */
  skip<U>(other: Parser<U, E>): Parser<T, E> {
    return this.chain((a) => other.map(() => a))
  }
  /**
   * `.then` parses `this` and then `other`, **keeping the result of `other`** and discarding `this`’s result.
   * This is equivalent to `this.chain(() => other)`.
   *
   * Use this to parse and discard a known prefix (e.g., a keyword) and keep the following value.
   *
   * Backtracking: if `other` fails, the whole `.then` fails; input consumed by `this` stays consumed.
   *
   * @param other The parser to run after `this`, whose result will be kept.
   * @returns A parser that yields the result of `other` if both succeed.
   */
  then<U>(other: Parser<U, E>): Parser<U, E> {
    return this.chain(() => other)
  }

  /**
   * `.between` parses `left`, then `this`, then `right`, **keeping only the result of `this`**.
   * Shorthand for `left.then(this).skip(right)`.
   *
   * Typical use: parse delimited constructs like `( expr )`, `[ expr ]`, `{ expr }`.
   *
   * Backtracking: if `left` succeeds but `this` or `right` fails, the whole `.between` fails and input consumed so far remains consumed.
   *
   * @param left  The opening delimiter parser.
   * @param right The closing delimiter parser.
   * @returns A parser yielding the result of `this` if all three succeed.
   */
  between<L, R>(left: Parser<L, E>, right: Parser<R, E>): Parser<T, E> {
    return left.chain(() => this.chain((mid) => right.map(() => mid)))
  }

  /**
   * `.lookahead` parses with **no consumption** on success. On success, it returns the same result as `this`
   * but restores the input position to what it was before parsing. On failure, it fails with the same error.
   *
   * Use this to make decisions based on upcoming input without committing to it (e.g., “is the next thing a newline?”).
   *
   * Performance note: because the input position is restored, repeated lookaheads at the same offset may re-parse the same region.
   *
   * @returns A parser that mirrors success/failure of `this` but never advances the input on success.
   */
  lookahead(): Parser<T, E> {
    return new Parser((state): ParserState<T, E> => {
      const s1 = this.p(state)
      if (s1.isError) return s1
      // succeed but restore the original index/position
      return { ...s1, index: state.index }
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
