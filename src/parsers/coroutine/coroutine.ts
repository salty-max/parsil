import {
  Parser,
  ParserState,
  updateError,
  updateResult,
} from '@parsil/parser/parser'

/**
 * A function that represents the shape of a parser function.
 * @template T The type of the parser result.
 */
type ParserFn<T, E = string> = (run: <K>(parser: Parser<K, E>) => K) => T

/**
 * `coroutine` lets you write a parser as a straight-line procedure that
 * "yields" sub-parsers via the `run` callback. Each call to `run(p)`
 * executes `p` against the current state, advances the cursor, and
 * returns the parsed value. If `p` fails, the surrounding coroutine
 * fails with the same error — no need to thread state by hand.
 *
 * Use this when a grammar branches on intermediate results (peek a
 * character, then dispatch to one of several sub-parsers); the coroutine
 * reads top-to-bottom, whereas nested `chain` calls nest sideways.
 *
 * @example
 * const parser = coroutine((run) => {
 *   const x = run(digits.map(Number))
 *   run(char(','))
 *   const y = run(digits.map(Number))
 *   return x + y
 * })
 * parser.run('40,2')  // { result: 42, index: 4, isError: false }
 *
 * @template T The type of the parser result.
 * @template E The type of the error envelope.
 * @param parserFn Procedure receiving a `run` callback. Use `run` for
 *   each sub-parser in turn; the callback returns the parsed value or
 *   short-circuits the coroutine on parse failure.
 * @returns A parser that runs the procedure as a single composite parser.
 */
export const coroutine = <T, E = string>(
  parserFn: ParserFn<T, E>
): Parser<T, E> => {
  return new Parser<T, E>((state) => {
    let currentState = state

    const run = <K>(parser: Parser<K, E>): K => {
      if (!(parser && parser instanceof Parser)) {
        // Programming error in the caller's coroutine body — the value
        // passed to `run` was not a Parser. Surface it as a parse failure
        // with the conventional ParseError prefix so consumers' errorMap
        // chains can intercept it.
        throw updateError(
          currentState,
          `ParseError @ index ${currentState.index} -> coroutine: 'run' must be called with a Parser, got ${typeof parser === 'object' && parser !== null ? Object.prototype.toString.call(parser) : String(parser)}`
        )
      }

      const nextState = parser.p(currentState)
      if (nextState.isError) {
        throw nextState
      }

      currentState = nextState as ParserState<unknown, E>
      return nextState.result
    }

    try {
      const result = parserFn(run)
      return updateResult(currentState, result) as ParserState<T, E>
    } catch (e) {
      // The two paths that intentionally throw out of the coroutine are
      // both ParserState envelopes (sub-parser failure or invalid `run`
      // argument). Re-thrown values that aren't ParserState shapes are
      // genuine bugs in the caller's body and are surfaced as parse
      // failures so the host doesn't see a raw Error escape from
      // `parser.run(...)`.
      if (isParserState(e)) {
        return e as ParserState<T, E>
      }
      const msg =
        e instanceof Error
          ? `${e.name}: ${e.message}`
          : `Threw non-Error value: ${String(e)}`
      return updateError(
        currentState,
        `ParseError @ index ${currentState.index} -> coroutine: ${msg}`
      ) as ParserState<T, E>
    }
  })
}

const isParserState = (x: unknown): x is ParserState<unknown, unknown> =>
  !!x &&
  typeof x === 'object' &&
  'isError' in x &&
  'index' in x &&
  'dataView' in x
