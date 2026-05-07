import { ParseError, parseError, Parser } from '@parsil/parser'

/**
 * Replace a parser's failure error with a generic "Expected `<name>`"
 * message. Use this when the inner error is implementation noise and a
 * single user-facing label is enough.
 *
 * Complementary to `inContext`, which **wraps** the error and preserves
 * the inner detail. Use `label` to drop noise; use `inContext` to keep
 * diagnostics.
 *
 * @example
 * const num = label('a number', digits.map(Number))
 * num.run('xyz')
 * // error.parser   = 'label'
 * // error.expected = 'a number'
 * // error.message  = 'Expected a number'
 *
 * @param name The user-facing description of what the parser expects.
 * @param p The parser to relabel.
 * @returns A parser that emits a `label`-shaped error on failure.
 */
export const label = <T>(
  name: string,
  p: Parser<T, ParseError>
): Parser<T, ParseError> =>
  p.errorMap(({ error }) =>
    parseError('label', error.index, `Expected ${name}`, {
      expected: name,
      context: error.context,
    })
  )
