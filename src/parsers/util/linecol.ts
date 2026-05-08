/**
 * Convert a byte offset into the input into a 1-based
 * `{ line, col }` pair.
 *
 * `col` is counted in bytes since the last line break — useful for
 * mapping back to editor positions when the input is a `DataView`
 * (parsil's internal representation). For ASCII input this matches
 * character columns; for multi-byte UTF-8 a single grapheme can
 * occupy several columns by this count.
 *
 * Recognises all three conventional line endings:
 *
 * - `\n` (LF, Unix)
 * - `\r\n` (CRLF, Windows) — counted as one line break
 * - `\r` (CR, classic Mac)
 *
 * @example
 * linecol('hello\nworld', 8) // { line: 2, col: 3 }
 * linecol('a\r\nb', 3)       // { line: 2, col: 1 }
 *
 * @param input The original input — a `string` or a `DataView`.
 * @param index Byte offset to convert. Clamped to the input length.
 * @returns A 1-based `{ line, col }` pair.
 */
export const linecol = (
  input: string | DataView,
  index: number
): { line: number; col: number } => {
  const bytes =
    typeof input === 'string'
      ? new TextEncoder().encode(input)
      : new Uint8Array(input.buffer, input.byteOffset, input.byteLength)

  const limit = Math.min(Math.max(index, 0), bytes.byteLength)

  let line = 1
  let col = 1

  for (let i = 0; i < limit; i++) {
    const b = bytes[i]
    if (b === 0x0d /* \r */) {
      line++
      col = 1
      // CRLF: skip the following \n so it doesn't count again.
      if (i + 1 < limit && bytes[i + 1] === 0x0a) i++
    } else if (b === 0x0a /* \n */) {
      line++
      col = 1
    } else {
      col++
    }
  }

  return { line, col }
}
