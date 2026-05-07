import { ParseError, parseError, Parser } from '@parsil/parser'

/**
 * Shorthand for replacing a parser's error message with a user-facing
 * string. Equivalent to `p.errorMap((e) => parseError(error.parser,
 * error.index, msg))`.
 *
 * Use {@link label} instead when you want the resulting error's
 * `expected` field set to the message; `expect` only replaces the
 * `message`. Both drop the inner detail.
 *
 * @example
 * const port = expect(intLit, 'a port number (0-65535)')
 * port.run('foo')  // error.message = 'a port number (0-65535)'
 *
 * @param p The parser to wrap.
 * @param msg The replacement message.
 * @returns A parser whose failure carries `msg` as its `message` field.
 */
export const expect = <T>(
  p: Parser<T, ParseError>,
  msg: string
): Parser<T, ParseError> =>
  p.errorMap(({ error }) =>
    parseError(error.parser, error.index, msg, {
      expected: error.expected,
      actual: error.actual,
      context: error.context,
    })
  )
