import { Parser } from '@parsil/parser'
import { satisfy } from '@parsil/parsers/char/satisfy'

/**
 * Match a single character that is one of the characters in `chars`.
 *
 * The supplied string is treated as a set of allowed characters
 * (UTF-8 code points). Order doesn't matter and duplicates are
 * harmless.
 *
 * @example
 * const op = oneOf('+-*\/')
 * op.run('+x')  // result: '+'
 * op.run('?x')  // ParseError: Expected one of '+-*\/'
 *
 * @param chars A string whose characters form the allowed set.
 * @returns A parser that consumes one character from the set.
 */
export const oneOf = (chars: string): Parser<string> => {
  if (!chars) {
    throw new TypeError(
      `oneOf must be called with a non-empty string, but got ''`
    )
  }
  const set = new Set([...chars])
  return satisfy((c) => set.has(c), `one of '${chars}'`)
}
