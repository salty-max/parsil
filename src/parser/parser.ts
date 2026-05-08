import { InputType, InputTypes, isTypedArray } from '@parsil/input-types'
import { encoder } from '@parsil/util'

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
 *
 * The input state's result type is `unknown`: a parser receives the
 * predecessor's state, whose `result` is irrelevant to this parser's
 * computation. The error type `E` flows through because chained
 * parsers share a single `E` channel — when an upstream parser has
 * already errored, its error is in the same shape this parser would
 * produce, so it can be forwarded without reshaping.
 *
 * Defaulting `E` to {@link ParseError} matches the structured error
 * shape every primitive emits. Consumers using a custom error type
 * override it explicitly via `errorMap`.
 *
 * For early-exit error forwarding, use {@link forward} — it
 * concentrates the necessary `unknown -> T` cast in one place so the
 * call sites read `if (state.isError) return forward(state)`.
 *
 * @template T The type of the result.
 * @template E The type of the error; defaults to `ParseError`.
 */
export type StateTransformerFn<T, E = ParseError> = (
  state: ParserState<unknown, E>
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

/**
 * Structured error produced by parsil's primitive parsers.
 *
 * The string format `ParseError @ index N -> <parser>: <message>` that
 * earlier versions emitted is now produced by {@link formatParseError}
 * for display. The structured fields let consumers branch on
 * `error.parser`, read `expected`/`actual` directly, and walk
 * `error.context` without regex-ing a string.
 *
 * Consumers can still attach their own error type via `Parser<T, MyError>`
 * — `errorMap` transforms `ParseError` into whatever shape they want.
 */
export type ParseError = {
  /** Machine-readable parser identity, e.g. 'char', 'str', 'regex', 'keyword'. */
  parser: string

  /** Byte offset where the error happened. Mirrors the envelope's index. */
  index: number

  /** User-readable description (no `ParseError @ index N -> X:` prefix; that's the formatter's job). */
  message: string

  /** What the parser was looking for, if known. Examples: `'a'`, `'end'`, `/^[0-9]/`. */
  expected?: string

  /** What was at the position, if known. */
  actual?: string

  /**
   * Context labels accumulated by `inContext` wrappers, outer-first.
   * `['function call', 'argument list', 'expression']` means "while
   * parsing a function call's argument list's expression".
   */
  context?: string[]
}

/**
 * Format a {@link ParseError} into the conventional display string
 * `ParseError [outer > inner] @ index N -> <parser>: <message>`. The
 * context bracket is omitted when there is no context.
 *
 * @param e The structured error to format.
 * @returns A human-readable string suitable for surface-level display.
 */
export const formatParseError = (e: ParseError): string => {
  const ctx =
    e.context && e.context.length > 0 ? ` [${e.context.join(' > ')}]` : ''
  return `ParseError${ctx} @ index ${e.index} -> ${e.parser}: ${e.message}`
}

/**
 * Convenience factory for building {@link ParseError} objects inside
 * primitive parsers. Equivalent to spelling out the object literal but
 * compresses the common case.
 *
 * @param parser The emitting parser's name (`'char'`, `'str'`, ...).
 * @param index The byte offset where the error happened.
 * @param message User-readable description.
 * @param extras Optional `expected`, `actual`, `context` fields.
 * @param extras.expected What the parser was looking for, when known.
 * @param extras.actual What was at the position, when known.
 * @param extras.context Outer-first context labels accumulated by `inContext`.
 * @returns A `ParseError` object.
 */
export const parseError = (
  parser: string,
  index: number,
  message: string,
  extras: { expected?: string; actual?: string; context?: string[] } = {}
): ParseError => ({
  parser,
  index,
  message,
  ...extras,
})

/**
 * Type guard narrowing a `ResultType<T, E>` to its successful `Ok<T>` shape.
 *
 * @param result The result envelope to inspect.
 * @returns `true` when the parse succeeded.
 */
export function isOk<T, E>(result: ResultType<T, E>): result is Ok<T> {
  return !result.isError
}

/**
 * Type guard narrowing a `ResultType<T, E>` to its failure `Err<E>` shape.
 *
 * @param result The result envelope to inspect.
 * @returns `true` when the parse failed.
 */
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
export class Parser<T, E = ParseError> {
  p: StateTransformerFn<T, E> // The state transformer function for this parser.

  /**
   * Constructs a parser instance using a parser state transformer function.
   * @param p The state transformer function for the parser.
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
    const initialState = createParserState(target) as ParserState<unknown, E>
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
    const state = createParserState(target) as ParserState<unknown, E>
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
      // The wrapped parser carries error type `E`; the wrapper exposes
      // `E2`. Re-cast on entry so the inner call typechecks; the cast is
      // safe because we either reshape the error below or forward the
      // success branch unchanged.
      const nextState = this.p(state as unknown as ParserState<unknown, E>)
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
   * Wrap this parser so its successful result carries the start/end byte
   * offsets it consumed. On failure, the original error is bubbled.
   *
   * @returns A parser yielding `{ value, start, end }` on success.
   */
  withSpan(): Parser<{ value: T; start: number; end: number }, E> {
    return new Parser(
      (state): ParserState<{ value: T; start: number; end: number }, E> => {
        const start = state.index
        const s1 = this.p(state)
        if (s1.isError) {
          return s1 as ParserState<{ value: T; start: number; end: number }, E>
        }
        const end = s1.index
        return updateResult(s1, { value: s1.result, start, end })
      }
    )
  }

  /**
   * Map the result of this parser into a caller-provided node shape,
   * passing the start/end byte offsets consumed alongside the value.
   *
   * @param build Function receiving the value and its `{ start, end }`
   *   span; returns the AST node (or any shape) the caller wants.
   * @returns A parser yielding the caller-built node on success.
   */
  spanMap<U>(
    build: (value: T, loc: { start: number; end: number }) => U
  ): Parser<U, E> {
    return this.withSpan().map(({ value, start, end }) =>
      build(value, { start, end })
    )
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
 *
 * @param state The previous state of the parser.
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
 *
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
 *
 * The returned state's result slot is typed `never`: a parser that
 * has failed cannot have produced a result, so the type system should
 * treat the result as unreachable. This also lets the failure branch
 * unify cleanly with the success branch in a parser's state
 * transformer (where the success branch produces `ParserState<T, E>`):
 * `ParserState<never, E2> | ParserState<T, E2>` simplifies to
 * `ParserState<T, E2>`.
 *
 * @param state The previous state of the parser.
 * @param error The new error value.
 * @returns A new parser state with updated error information.
 */
export const updateError = <E2>(
  state: ParserState<unknown, unknown>,
  error: E2
): ParserState<never, E2> =>
  ({
    ...state,
    isError: true,
    error,
  }) as ParserState<never, E2>

/**
 * Forward a predecessor error-state untouched.
 *
 * Used at the top of every parser to short-circuit on an upstream
 * error: `if (state.isError) return forward(state)`. The cast is safe
 * because the caller has just observed `isError === true`, so
 * `result` is irrelevant — only `error` and `index` are read
 * downstream. The cast is concentrated here so the unsafety lives in
 * exactly one spot rather than at every call site.
 *
 * The return type uses `never` for the result slot: `never` is a
 * subtype of any `T`, so a `ParserState<never, E>` reads as
 * `ParserState<T, E>` in the union returned from a parser's state
 * transformer without forcing the caller to annotate `T` explicitly.
 *
 * @param state The predecessor state to forward.
 * @returns The same state typed as `ParserState<never, E>`.
 */
export const forward = <E>(
  state: ParserState<unknown, E>
): ParserState<never, E> => state as ParserState<never, E>
