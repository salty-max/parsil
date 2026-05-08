import { Parser } from '@parsil/parser'
import { viewReader } from '@parsil/parsers/binary/_view-reader'

/** Read 2 bytes as a signed little-endian integer (-32768..32767). */
export const int16LE: Parser<number> = viewReader('int16LE', 2, (dv, i) =>
  dv.getInt16(i, true)
)
