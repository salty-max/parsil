import { Parser } from '@parsil/parser'
import { viewReader } from '@parsil/parsers/binary/_view-reader'

/** Read 8 bytes as a 64-bit IEEE 754 big-endian float. */
export const doubleBE: Parser<number> = viewReader('doubleBE', 8, (dv, i) =>
  dv.getFloat64(i, false)
)
