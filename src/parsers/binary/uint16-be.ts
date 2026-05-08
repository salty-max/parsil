import { Parser } from '@parsil/parser'
import { viewReader } from '@parsil/parsers/binary/_view-reader'

/** Read 2 bytes as an unsigned big-endian integer (0..65535). */
export const uint16BE: Parser<number> = viewReader('uint16BE', 2, (dv, i) =>
  dv.getUint16(i, false)
)
