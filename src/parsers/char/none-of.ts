import { Parser } from '@parsil/parser'
import { satisfy } from '@parsil/parsers/char/satisfy'

/**
 * Match a single character that is **not** one of the characters in
 * `chars`. The dual of {@link oneOf}.
 *
 * @example
 * const notDelim = noneOf(',;\\n')
 * notDelim.run('abc')  // result: 'a'
 * notDelim.run(',xy')  // ParseError: Expected anything but ',;\\n'
 *
 * @param chars A string whose characters form the disallowed set.
 * @returns A parser that consumes one character not in the set.
 */
export const noneOf = (chars: string): Parser<string> => {
  if (!chars) {
    throw new TypeError(
      `noneOf must be called with a non-empty string, but got ''`
    )
  }
  const set = new Set([...chars])
  return satisfy((c) => !set.has(c), `anything but '${chars}'`)
}
