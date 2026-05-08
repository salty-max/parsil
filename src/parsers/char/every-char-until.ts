import { Parser } from '@parsil/parser'
import {
  CollectStep,
  collectUntil,
} from '@parsil/parsers/everything-until/_collect-until'
import { getNextCharWidth, getUtf8Char } from '@parsil/util'

/**
 * Read one UTF-8 char at the cursor. Returns `null` at end of input.
 *
 * Advances by the char's encoded byte width (1-4), so the cursor
 * always lands on a char boundary. UTF-8's self-synchronizing property
 * guarantees that a sentinel parser tested between iterations only
 * matches at a true char boundary as well.
 *
 * @param state Current parser state.
 * @returns The decoded char and its byte width, or `null` if EOI.
 */
const charStep: CollectStep<string> = (state) => {
  const { dataView, index } = state
  if (index >= dataView.byteLength) return null
  const width = getNextCharWidth(index, dataView)
  if (index + width > dataView.byteLength) return null
  return { unit: getUtf8Char(index, width, dataView), advance: width }
}

/**
 * Collect the input **char-by-char** (UTF-8 aware) until the given
 * sentinel parser would succeed. Returns the collected prefix as a
 * `string`.
 *
 * Char-level: for inputs containing multi-byte UTF-8 (e.g. `'héllo'`,
 * `'日本語'`), the returned string is composed of complete characters,
 * never split mid-codepoint. For binary inputs treated as UTF-8, the
 * decoder reassembles the bytes into a string (lossy if the bytes are
 * not valid UTF-8). For raw byte collection, see `everythingUntil`.
 *
 * The sentinel is **not** consumed. If end of input is reached before
 * the sentinel matches, the parser fails with a structured
 * `ParseError` (`parser: 'everyCharUntil'`).
 *
 * @example
 * everyCharUntil(str('end')).run('123end456') // '123'
 * everyCharUntil(str(',')).run('日本語,foo')   // '日本語'
 * everyCharUntil(str('€')).run('hé€llo')       // 'hé'
 *
 * @param parser Sentinel parser whose success stops collection.
 * @returns A parser yielding the consumed prefix as a string.
 */
export const everyCharUntil = <T>(parser: Parser<T>): Parser<string> =>
  collectUntil('everyCharUntil', charStep, parser).map((chars) =>
    chars.join('')
  )
