import {
  parseError,
  Parser,
  ParserState,
  updateError,
  updateResult,
  updateState,
} from '@parsil/parser'

/**
 * One step of the `collectUntil` driver: inspect the current state and
 * either return the unit at the cursor (with how far to advance) or
 * `null` to signal end of input.
 *
 * Not part of the public API.
 */
export type CollectStep<U> = (
  state: ParserState<unknown, unknown>
) => { unit: U; advance: number } | null

/**
 * Internal driver shared by `everythingUntil` and `everyCharUntil`.
 *
 * Repeatedly tries the sentinel `parser` at the current cursor:
 * - on success, stops without consuming the sentinel and returns the
 *   collected units;
 * - on failure, calls `step` to read one unit at the cursor and
 *   advance, then loops.
 *
 * Emits a structured `ParseError` (with `parser: name`) when the input
 * is exhausted before the sentinel matches.
 *
 * Not part of the public API.
 *
 * @param name Identifier surfaced as `error.parser` on EOI.
 * @param step Reads one unit at the cursor; returns `null` at EOI.
 * @param parser Sentinel parser whose success terminates collection.
 * @returns A `Parser<U[]>` collecting units in order.
 */
export const collectUntil = <U, T>(
  name: string,
  step: CollectStep<U>,
  parser: Parser<T>
): Parser<U[]> =>
  new Parser((state) => {
    if (state.isError) return state

    const units: U[] = []
    let cursor: ParserState<unknown, unknown> = state

    while (true) {
      const probe = parser.p(cursor)
      if (!probe.isError) {
        return updateResult(cursor, units)
      }

      const next = step(cursor)
      if (next === null) {
        return updateError(
          cursor,
          parseError(name, cursor.index, 'Unexpected end of input')
        )
      }

      units.push(next.unit)
      cursor = updateState(cursor, cursor.index + next.advance, next.unit)
    }
  })
