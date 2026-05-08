import { Parser } from '@parsil/parser'
import { viewReader } from '@parsil/parsers/binary/_view-reader'

/**
 * Read a single unsigned byte (0..255).
 *
 * @example
 * const buf = new Uint8Array([0x2a])
 * anyByte.run(new DataView(buf.buffer)) // result: 42
 */
export const anyByte: Parser<number> = viewReader('anyByte', 1, (dv, i) =>
  dv.getUint8(i)
)
