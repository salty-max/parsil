import { Parser } from '@parsil/parser'
import { everythingUntil } from '@parsil/parsers/everything-until'

/**
 * Char-level (UTF-8 aware) collection: gather complete UTF-8 chars
 * until the sentinel parser would succeed, then return the consumed
 * prefix as a `string`. Equivalent to `everythingUntil(p, 'chars')`.
 *
 * @deprecated Prefer `everythingUntil(p, 'chars')` — the `mode`-based
 * API unifies byte- and char-level collection under one entry point.
 * `everyCharUntil` remains as a thin alias for backwards readability
 * and may be removed in a future major version.
 *
 * @param parser Sentinel parser whose success stops collection.
 * @returns A parser yielding the consumed prefix as a string.
 */
export const everyCharUntil = <T>(parser: Parser<T>): Parser<string> =>
  everythingUntil(parser, 'chars')
