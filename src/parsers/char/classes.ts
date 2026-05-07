import { Parser } from '@parsil/parser'
import { satisfy } from '@parsil/parsers/char/satisfy'

/**
 * Match a single ASCII alphanumeric character `[A-Za-z0-9]`.
 *
 * @returns A parser that consumes one alphanumeric character.
 */
export const alphaNum: Parser<string> = satisfy(
  (c) => /^[A-Za-z0-9]$/.test(c),
  'alphanumeric character'
)

/**
 * Match a single ASCII hexadecimal digit `[0-9A-Fa-f]`.
 *
 * @returns A parser that consumes one hex digit.
 */
export const hexDigit: Parser<string> = satisfy(
  (c) => /^[0-9A-Fa-f]$/.test(c),
  'hex digit'
)

/**
 * Match a single ASCII octal digit `[0-7]`.
 *
 * @returns A parser that consumes one octal digit.
 */
export const octDigit: Parser<string> = satisfy(
  (c) => /^[0-7]$/.test(c),
  'octal digit'
)

/**
 * Match a single ASCII uppercase letter `[A-Z]`.
 *
 * @returns A parser that consumes one uppercase letter.
 */
export const upper: Parser<string> = satisfy(
  (c) => /^[A-Z]$/.test(c),
  'uppercase letter'
)

/**
 * Match a single ASCII lowercase letter `[a-z]`.
 *
 * @returns A parser that consumes one lowercase letter.
 */
export const lower: Parser<string> = satisfy(
  (c) => /^[a-z]$/.test(c),
  'lowercase letter'
)
