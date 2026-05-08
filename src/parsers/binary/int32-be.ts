import { Parser } from '@parsil/parser'
import { viewReader } from '@parsil/parsers/binary/_view-reader'

/** Read 4 bytes as a signed big-endian integer (-2^31..2^31-1). */
export const int32BE: Parser<number> = viewReader('int32BE', 4, (dv, i) =>
  dv.getInt32(i, false)
)
