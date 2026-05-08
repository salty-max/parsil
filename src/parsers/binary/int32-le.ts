import { Parser } from '@parsil/parser'
import { viewReader } from '@parsil/parsers/binary/_view-reader'

/** Read 4 bytes as a signed little-endian integer (-2^31..2^31-1). */
export const int32LE: Parser<number> = viewReader('int32LE', 4, (dv, i) =>
  dv.getInt32(i, true)
)
