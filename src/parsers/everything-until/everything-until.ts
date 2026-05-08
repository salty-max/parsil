import { Parser } from '@parsil/parser'
import {
  CollectStep,
  collectUntil,
} from '@parsil/parsers/everything-until/_collect-until'

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
 * Collect the input **byte-by-byte** until the given sentinel parser
 * would succeed. Returns the collected bytes as `number[]`.
 *
 * Byte-level: regardless of whether the input was a `string`,
 * `Uint8Array`, `ArrayBuffer`, or `DataView`, this returns the raw
 * byte values — including UTF-8 continuation bytes (0x80-0xBF) when
 * the input is a string with multi-byte chars. For char-level
 * collection that produces a string, see `everyCharUntil`.
 *
 * The sentinel is **not** consumed. If end of input is reached before
 * the sentinel matches, the parser fails with a structured
 * `ParseError` (`parser: 'everythingUntil'`).
 *
 * @example
 * everythingUntil(str('end')).run('123end456')          // [49, 50, 51]
 * everythingUntil(str('end')).run(new Uint8Array([0,1,2,101,110,100]))  // [0, 1, 2]
 * everythingUntil(str('end')).run('é-end')              // [0xC3, 0xA9, 0x2D]
 *
 * @param parser Sentinel parser whose success stops collection.
 * @returns A parser that yields the collected bytes.
 */
export const everythingUntil = <T>(parser: Parser<T>): Parser<number[]> =>
  collectUntil('everythingUntil', byteStep, parser)
