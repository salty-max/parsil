import { Parser } from '@parsil/parser'
import { possibly } from '@parsil/parsers/possibly'
import { regex } from '@parsil/parsers/regex'

/**
 * Wrap a number-producing parser to optionally accept a leading `+` or
 * `-` sign. A leading `-` negates the result; `+` is preserved as-is;
 * absent sign is unchanged.
 *
 * @example
 * const num = digits.map(Number)
 * signed(num).run('-42')   // result: -42
 * signed(num).run('+42')   // result:  42
 * signed(num).run('42')    // result:  42
 *
 * @param p Parser yielding the numeric value (without sign).
 * @returns A parser yielding the signed value.
 */
export const signed = <T extends number>(p: Parser<T>): Parser<T> =>
  possibly(regex(/^[+-]/)).chain((sign) =>
    p.map((n) => (sign === '-' ? (-n as T) : n))
  )
