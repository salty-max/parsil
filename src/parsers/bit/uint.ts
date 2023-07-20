import { Parser } from '../../parser/parser'
import { sequenceOf } from '../sequence-of'
import { bit } from './bit'

/**
 * `uint` reads the next `n` bits from the input and interprets them as an unsigned integer.
 *
 * @example
 * const parser = uint(8)
 * const input = new Uint8Array([42])
 * const result = parser.run(new DataView(input.buffer))
 *
 * @param n The number of bits to parse as an unsigned integer.
 * @returns {Parser<number>} A parser that reads the next `n` bits as an unsigned integer.
 */
export const uint = (n: number): Parser<number> => {
  if (n < 1) {
    throw new Error(`uint: n must be larger than 0, but got ${n}`)
  }

  if (n > 32) {
    throw new Error(`uint: n must be less than 32, but got ${n}`)
  }

  return sequenceOf(Array.from({ length: n }, () => bit)).map(
    (bits: number[]) => {
      return bits.reduce((acc, bit, i) => {
        return acc + Number(BigInt(bit) << BigInt(n - 1 - i))
      }, 0)
    }
  )
}
