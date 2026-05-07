import { Parser } from '@parsil/parser'
import { everythingUntil } from '@parsil/parsers/everything-until'
import { decoder } from '@parsil/util'

/**
 * `everyCharUntil` is a higher-order parser that consumes the input until
 * the provided `parser` would succeed at the current position, then
 * returns everything before that point as a UTF-8 string.
 *
 * Unlike `everythingUntil` (which returns the raw byte values), this
 * parser decodes the collected bytes via `TextDecoder`.
 *
 * UTF-8 correctness note: the underlying byte-by-byte walk is safe even
 * for inputs containing multi-byte chars. UTF-8 is self-synchronizing —
 * continuation bytes (0x80-0xBF) cannot be confused with start bytes or
 * with ASCII (0x00-0x7F), so a marker like `str('é')` ([0xC3, 0xA9]) only
 * matches at a true char boundary, and `decoder.decode` reassembles the
 * collected bytes into a valid UTF-8 string. The full test matrix lives
 * in `tests/parsers/char/every-char-until.spec.ts`.
 *
 * @example
 * everyCharUntil(str('end')).run('123end456') // '123'
 * everyCharUntil(str(',')).run('日本語,foo')     // '日本語'
 *
 * @param parser A parser that defines the condition for the end of consumption.
 * @returns A parser that consumes input until `parser` would succeed and
 *   returns the consumed prefix as a string.
 */
export const everyCharUntil = <T>(parser: Parser<T>) =>
  everythingUntil(parser).map((results) =>
    decoder.decode(Uint8Array.from(results))
  )
