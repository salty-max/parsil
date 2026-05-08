import { Parser } from '@parsil/parser'
import { viewReader } from '@parsil/parsers/binary/_view-reader'

/** Read 4 bytes as a 32-bit IEEE 754 big-endian float. */
export const floatBE: Parser<number> = viewReader('floatBE', 4, (dv, i) =>
  dv.getFloat32(i, false)
)
