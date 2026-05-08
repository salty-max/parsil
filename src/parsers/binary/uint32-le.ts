import { Parser } from '@parsil/parser'
import { viewReader } from '@parsil/parsers/binary/_view-reader'

/** Read 4 bytes as an unsigned little-endian integer (0..2^32-1). */
export const uint32LE: Parser<number> = viewReader('uint32LE', 4, (dv, i) =>
  dv.getUint32(i, true)
)
