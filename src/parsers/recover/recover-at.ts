import {
  forward,
  ParseError,
  Parser,
  ParserState,
  updateResult,
  updateState,
} from '@parsil/parser'
import { getNextCharWidth } from '@parsil/util'

/**
 * Result envelope produced by {@link recoverAt}.
 *
 * @template T The successful result type of the wrapped parser.
 */
export type RecoveryResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: ParseError; index: number }

/**
 * Try `p`. If it succeeds, yield `{ ok: true, value }`. If it fails,
 * **recover** by consuming input character-by-character until a
 * non-consuming match of `sync` would succeed (or end-of-input is
 * reached), then yield `{ ok: false, error, index }` where `error` is
 * the original failure and `index` is the position where it happened.
 *
 * The wrapped parser **always succeeds** at the recovery envelope
 * level — the outer parser can keep going. This is the building block
 * for collecting multiple parse errors per source file (a compiler's
 * "report all errors" mode), instead of stopping at the first.
 *
 * `sync` is checked **without consuming** the synchronization marker
 * itself (the outer parser is expected to consume it via the
 * surrounding grammar, e.g. `sepBy(char(';'))(recoverAt(stmt,
 * char(';')))`).
 *
 * Edge cases:
 * - If `p` succeeds, no recovery happens; result is `{ ok: true, value }`.
 * - If `p` fails and `sync` is already satisfied at the current
 *   position, no input is consumed; result is `{ ok: false, error, index }`.
 * - If `p` fails and `sync` is never found before end-of-input, the
 *   parser consumes to EOI and yields `{ ok: false, error, index }`.
 * - End-of-input alone is treated as a synchronization point; recovery
 *   never loops past the buffer.
 *
 * @example
 * const stmt = expression
 * const sep = char(';')
 * const recoveredStmt = recoverAt(stmt, sep)
 * const program = sepBy(sep)(recoveredStmt)
 *
 * program.run('a; INVALID; b; c')
 * // result includes 4 RecoveryResults: [ok 'a', ok-failure for INVALID, ok 'b', ok 'c']
 *
 * @param p The parser to try.
 * @param sync A non-consuming parser that signals where recovery
 *   should stop (typically a statement separator or block delimiter).
 * @returns A parser that always succeeds, yielding a `RecoveryResult<T>`.
 */
export const recoverAt = <T>(
  p: Parser<T>,
  sync: Parser<unknown>
): Parser<RecoveryResult<T>> =>
  new Parser<RecoveryResult<T>>(
    (state): ParserState<RecoveryResult<T>, ParseError> => {
      if (state.isError) return forward(state)

      // Try p first.
      const out = p.p(state)
      if (!out.isError) {
        return updateResult(out, { ok: true, value: out.result } as const)
      }

      const failureIndex = out.index
      const failureError = out.error

      // Recover: walk forward until sync succeeds (peeked, no consume) or EOI.
      let cursor = state.index
      const { dataView } = state

      while (cursor < dataView.byteLength) {
        // Build a state-at-cursor and try sync against it without consuming.
        const probe = { ...state, index: cursor, isError: false }
        const syncOut = sync.p(probe)
        if (!syncOut.isError) {
          break // synchronized
        }
        // Advance one UTF-8 char.
        const width = getNextCharWidth(cursor, dataView)
        cursor += width || 1
      }

      const recovered: RecoveryResult<T> = {
        ok: false,
        error: failureError,
        index: failureIndex,
      }
      // Advance the parser cursor to the sync position (or EOI) and
      // emit the recovery envelope as the success value.
      return updateState(state, cursor, recovered)
    }
  )
