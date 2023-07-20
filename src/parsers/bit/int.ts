import { Parser } from '../../parser/parser'
import { sequenceOf } from '../sequence-of'
import { bit } from './bit'

/**
 * `int` reads the next `n` bits from the input and interprets them as an signed integer.
 *
 * @example
 * const parser = uint(4); // Parses 4 bits as an signed integer
 * parser.run(bitset)  // returns the parsed signed integer if successful, otherwise fails
 *
 * @param n The number of bits to parse as an signed integer.
 * @returns {Parser<number>} A parser that reads the next `n` bits as an signed integer.
 */
export const int = (n: number): Parser<number> => {
  if (n < 1) {
    throw new Error(`int: n must be larger than 0, but got ${n}`)
  }

  if (n > 32) {
    throw new Error(`int: n must be less than 32, but got ${n}`)
  }

  return sequenceOf(Array.from({ length: n }, () => bit)).map(
    (bits: number[]) => {
      if (bits[0] === 0) {
        return bits.reduce((acc, bit, i) => {
          return acc + Number(BigInt(bit) << BigInt(n - 1 - i))
        }, 0)
      } else {
        return -(
          1 +
          bits.reduce((acc, bit, i) => {
            return acc + Number(BigInt(bit === 0 ? 1 : 0) << BigInt(n - 1 - i))
          }, 0)
        )
      }
    }
  )
}
