import { parseError, Parser } from '@parsil/parser'
import { regex } from '@parsil/parsers/regex'

// Optional sign, integer part, optional fraction, optional exponent.
// At least one of: fraction, exponent — must be present (otherwise it's an int).
const floatRe = /^[+-]?\d+(\.\d+([eE][+-]?\d+)?|[eE][+-]?\d+)/

/**
 * Match a floating-point literal: optional sign + digits + optional
 * `.digits` + optional `e[+-]?digits`. At least one of fraction or
 * exponent must be present (`42` alone is not a float; use `intLit`).
 * Returns the JS `number` value.
 *
 * @example
 * floatLit.run('3.14')         // result: 3.14
 * floatLit.run('-2.5e3')       // result: -2500
 * floatLit.run('1e-10')        // result: 1e-10
 * floatLit.run('42')           // ParseError (no fraction or exponent)
 *
 * @returns A parser yielding the parsed float.
 */
export const floatLit: Parser<number> = regex(floatRe)
  .map((s) => Number(s))
  .errorMap(({ index }) =>
    parseError('floatLit', index, 'Expected a floating-point literal', {
      expected:
        '[+-]?<digits>(.<digits>([eE][+-]?<digits>)?|[eE][+-]?<digits>)',
    })
  )
