import { Parser } from '@parsil/parser'
import { viewReader } from '@parsil/parsers/binary/_view-reader'

/** Read 4 bytes as an unsigned big-endian integer (0..2^32-1). */
export const uint32BE: Parser<number> = viewReader('uint32BE', 4, (dv, i) =>
  dv.getUint32(i, false)
)
