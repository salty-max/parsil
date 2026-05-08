import { ParseError, Parser } from '@parsil/parser'

/**
 * Wrap a parser so its `ParseError.context` carries a stack of labels
 * accumulated by enclosing `inContext` calls. Outer labels are pushed
 * to the front: `inContext('outer', inContext('inner', p))` produces
 * `error.context === ['outer', 'inner']` on failure.
 *
 * `formatParseError` renders the context as `[outer > inner]` in the
 * display string.
 *
 * `inContext` is the wrap-style complement of `label` (which **replaces**
 * the error). Use `inContext` when you want to preserve the inner
 * error's specifics and add scope; use `label` when the inner error is
 * noise and a single "expected X" message is enough.
 *
 * @example
 * const argList = inContext('argument list', sepBy(comma)(arg))
 * // On failure: error.context === ['argument list']
 *
 * @example
 * const fnCall = inContext(
 *   'function call',
 *   sequenceOf([identifier, lparen, argList, rparen])
 * )
 * // Nested failure: error.context === ['function call', 'argument list']
 *
 * @param label A human-readable label describing what is being parsed.
 * @param p The parser to wrap.
 * @returns A parser that yields `p`'s result on success and pushes
 *   `label` onto `error.context` on failure.
 */
export const inContext = <T>(
  label: string,
  p: Parser<T, ParseError>
): Parser<T, ParseError> =>
  p.errorMap(
    ({ error }): ParseError => ({
      ...error,
      context: [label, ...(error.context ?? [])],
    })
  )
