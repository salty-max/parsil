const Encoder = globalThis.TextEncoder
const Decoder = globalThis.TextDecoder

if (!Encoder || !Decoder) {
  throw new Error('Parsil requires global TextEncoder and TextDecoder')
}

export const encoder = new Encoder()
export const decoder = new Decoder()

export const getString = (
  index: number,
  length: number,
  dataView: DataView
) => {
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) bytes[i] = dataView.getUint8(index + i)
  return decoder.decode(bytes)
}

export const getNextCharWidth = (index: number, dataView: DataView) => {
  const byte = dataView.getUint8(index)
  if ((byte & 0x80) === 0x00) return 1 // 0xxxxxxx
  if ((byte & 0xe0) === 0xc0) return 2 // 110xxxxx
  if ((byte & 0xf0) === 0xe0) return 3 // 1110xxxx
  if ((byte & 0xf8) === 0xf0) return 4 // 11110xxx
  return 1 // fallback
}

export const getUtf8Char = (
  index: number,
  length: number,
  dataView: DataView
) => {
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) bytes[i] = dataView.getUint8(index + i)
  return decoder.decode(bytes)
}

export const getCharacterLength = (str: string): number => {
  let count = 0
  for (const _ of str) count++
  return count
}
