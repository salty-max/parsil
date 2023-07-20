import { Parser } from '../../parser/parser'
import { fail } from '../fail'
import { sequenceOf } from '../sequence-of'
import { succeed } from '../succeed'
import { uint } from './uint'

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
 * @returns {Parser<number[], string>} A parser that matches the provided string as a sequence of ASCII codes.
 * @throws {Error} If the input string is empty.
 */
export const rawString = (s: string): Parser<number[], string> => {
  if (s.length < 1) {
    throw new Error(`rawString: input must be at least 1 character`)
  }

  const bytes = s
    .split('')
    .map((c) => c.charCodeAt(0))
    .map((n) => {
      return uint(8).chain((res) => {
        if (res == n) {
          return succeed(n)
        } else {
          return fail(
            `ParseError -> rawString: Expected character ${String.fromCharCode(
              n
            )}, but got ${String.fromCharCode(res)}`
          )
        }
      })
    })

  return sequenceOf(bytes)
}
