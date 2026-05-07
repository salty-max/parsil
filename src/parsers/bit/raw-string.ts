import { ParseError, parseError, Parser } from '@parsil/parser/parser'
import { uint } from '@parsil/parsers/bit/uint'
import { fail } from '@parsil/parsers/fail'
import { sequenceOf } from '@parsil/parsers/sequence-of'
import { succeed } from '@parsil/parsers/succeed'

/**
 * `rawString` matches a string of characters exactly as provided.
 * Each character in the input string is converted to its corresponding ASCII code
 * and a parser is created for each ASCII code.
 * The resulting parsers are chained together using sequenceOf to ensure they are parsed in order.
 * The parser succeeds if all characters are matched in the input and fails otherwise.
 *
 * @example
 * const parser = rawString("hello");
 * parser.run("hello world"); // returns { isError: false, result: [104, 101, 108, 108, 111], index: 5 }
 *
 * @param s The string to match in the input.
 * @returns A parser that matches the provided string as a sequence of ASCII codes.
 * @throws {Error} If the input string is empty.
 */
export const rawString = (s: string): Parser<number[]> => {
  if (s.length < 1) {
    throw new Error(`rawString: input must be at least 1 character`)
  }

  const bytes = [...s]
    .map((c) => c.charCodeAt(0))
    .map((n) => {
      return uint(8).chain((res): Parser<number> => {
        if (res === n) {
          return succeed<number>(n)
        }
        return fail<ParseError>(
          parseError(
            'rawString',
            // The chain consumer doesn't know the index here; uint(8)
            // already advanced. Use 0 as a placeholder; the surface
            // wrapper carries the actual position.
            0,
            `Expected character ${String.fromCharCode(n)}, but got ${String.fromCharCode(res)}`,
            {
              expected: String.fromCharCode(n),
              actual: String.fromCharCode(res),
            }
          )
        )
      })
    })

  return sequenceOf(bytes)
}
