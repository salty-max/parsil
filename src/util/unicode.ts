const Encoder = globalThis.TextEncoder
const Decoder = globalThis.TextDecoder

if (!Encoder || !Decoder) {
  throw new Error('Parsil requires global TextEncoder and TextDecoder')
}

export const encoder = new Encoder()
export const decoder = new Decoder()

/**
 * Decode a slice of bytes from a `DataView` into a UTF-8 string.
 *
 * @param index The byte offset to start from.
 * @param length The number of bytes to read.
 * @param dataView The buffer to read from.
 * @returns The decoded string.
 */
export const getString = (
  index: number,
  length: number,
  dataView: DataView
) => {
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) bytes[i] = dataView.getUint8(index + i)
  return decoder.decode(bytes)
}

/**
 * Return the byte width of the UTF-8 character starting at `index`.
 * Falls back to 1 when the lead byte doesn't match a known UTF-8 prefix.
 *
 * @param index The byte offset of the lead byte.
 * @param dataView The buffer to inspect.
 * @returns The character width in bytes (1, 2, 3, or 4).
 */
export const getNextCharWidth = (index: number, dataView: DataView) => {
  const byte = dataView.getUint8(index)
  if ((byte & 0x80) === 0x00) return 1 // 0xxxxxxx
  if ((byte & 0xe0) === 0xc0) return 2 // 110xxxxx
  if ((byte & 0xf0) === 0xe0) return 3 // 1110xxxx
  if ((byte & 0xf8) === 0xf0) return 4 // 11110xxx
  return 1 // fallback
}

/**
 * Decode a single UTF-8 character at `index`, given its byte length.
 * Use {@link getNextCharWidth} to resolve the length first.
 *
 * @param index The byte offset of the character's lead byte.
 * @param length The character's byte width (1-4).
 * @param dataView The buffer to read from.
 * @returns The decoded one-character string.
 */
export const getUtf8Char = (
  index: number,
  length: number,
  dataView: DataView
) => {
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) bytes[i] = dataView.getUint8(index + i)
  return decoder.decode(bytes)
}

/**
 * Count the number of code points (visual characters) in a string,
 * which differs from `String#length` for multi-byte UTF-8 characters.
 *
 * @param str The string to measure.
 * @returns The number of code points.
 */
export const getCharacterLength = (str: string): number => {
  let count = 0
  for (const _ of str) count++
  return count
}
