let text: { Encoder: typeof TextEncoder; Decoder: typeof TextDecoder }

const textEncoder =
  TextEncoder === undefined ? require('util').TextEncoder : TextEncoder
const textDecoder =
  TextDecoder === undefined ? require('util').TextDecoder : TextDecoder

try {
  text = { Encoder: textEncoder, Decoder: textDecoder }
} catch (err) {
  throw new Error(
    'Parsil requires TextEncoder and TextDecoder to be polyfilled'
  )
}

export const encoder = new text.Encoder()
export const decoder = new text.Decoder()

export const getString = (
  index: number,
  length: number,
  dataView: DataView
) => {
  const bytes = Uint8Array.from({ length }, (_, i) =>
    dataView.getUint8(index + i)
  )
  return decoder.decode(bytes)
}

export const getNextCharWidth = (index: number, dataView: DataView) => {
  const byte = dataView.getUint8(index)
  if ((byte & 0x00) >> 7 === 0) return 1
  else if ((byte & 0xe0) >> 5 === 0b110) return 2
  else if ((byte & 0xf0) >> 4 === 0b1110) return 3
  else if ((byte & 0xf0) >> 4 === 0b1111) return 4
  return 1
}

export const getUtf8Char = (
  index: number,
  length: number,
  dataView: DataView
) => {
  const bytes = Uint8Array.from({ length }, (_, i) =>
    dataView.getUint8(index + i)
  )
  return decoder.decode(bytes)
}

export const getCharacterLength = (str: string): number => {
  let cp
  let total = 0
  let i = 0
  while (i < str.length) {
    cp = str.codePointAt(i)
    while (cp) {
      cp = cp >> 8
      i++
    }
    total++
  }

  return total
}
