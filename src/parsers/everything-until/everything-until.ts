import { Parser } from '@parsil/parser'
import {
  CollectStep,
  collectUntil,
} from '@parsil/parsers/everything-until/_collect-until'
import { getNextCharWidth, getUtf8Char } from '@parsil/util'

/**
 * Read one byte at the cursor. Returns `null` at end of input.
 *
 * @param state Current parser state.
 * @returns The byte value and a fixed advance of `1`, or `null` if EOI.
 */
const byteStep: CollectStep<number> = (state) => {
  const { dataView, index } = state
  if (index >= dataView.byteLength) return null
  return { unit: dataView.getUint8(index), advance: 1 }
}

/**
 * Read one UTF-8 char at the cursor. Returns `null` at end of input.
 *
 * Advances by the char's encoded byte width (1-4), so the cursor
 * always lands on a char boundary. UTF-8's self-synchronizing property
 * guarantees the sentinel parser, when probed between iterations, can
 * only match at a true char boundary as well.
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
 * Selects the granularity at which `everythingUntil` collects input.
 *
 * - `'bytes'` (default) — yield raw byte values, including UTF-8
 *   continuation bytes from string inputs.
 * - `'chars'` — yield complete UTF-8 codepoints, decoded into a
 *   string. Works on string inputs and on UTF-8 byte buffers.
 */
export type CollectMode = 'bytes' | 'chars'

/**
 * Collect the input until the given sentinel parser would succeed.
 * The sentinel is **not** consumed. If end of input is reached before
 * it matches, the parser fails with a structured `ParseError`
 * (`parser: 'everythingUntil'`).
 *
 * The optional `mode` argument selects the collection granularity:
 *
 * - `'bytes'` (default) — returns `number[]` of raw byte values,
 *   regardless of input shape (string, `ArrayBuffer`, `TypedArray`,
 *   `DataView`). For string inputs containing multi-byte UTF-8, this
 *   includes continuation bytes (0x80-0xBF).
 * - `'chars'` — returns a `string` of complete UTF-8 codepoints.
 *   Advances by full codepoint width per step, so the cursor never
 *   lands mid-character. For binary buffers, the bytes are decoded as
 *   UTF-8 (lossy if the bytes are not valid UTF-8).
 *
 * @example
 * everythingUntil(str('end')).run('123end456')          // [49, 50, 51]
 * everythingUntil(str('end'), 'bytes').run('é-end')     // [0xC3, 0xA9, 0x2D]
 * everythingUntil(str(','), 'chars').run('日本語,foo')   // '日本語'
 *
 * @param parser Sentinel parser whose success stops collection.
 * @param mode Granularity of collection — `'bytes'` (default) or `'chars'`.
 * @returns A parser yielding the collected input.
 */
export function everythingUntil<T>(
  parser: Parser<T>,
  mode?: 'bytes'
): Parser<number[]>
export function everythingUntil<T>(
  parser: Parser<T>,
  mode: 'chars'
): Parser<string>
export function everythingUntil<T>(
  parser: Parser<T>,
  mode: CollectMode = 'bytes'
): Parser<number[]> | Parser<string> {
  if (mode === 'chars') {
    return collectUntil('everythingUntil', charStep, parser).map((chars) =>
      chars.join('')
    )
  }
  return collectUntil('everythingUntil', byteStep, parser)
}
