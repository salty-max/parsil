/**
 * Version: 4
 * Header Length: 5 * 32-bit = 20 bytes
 * TOS: 0x00
 * Total Length: 0x0044 (68 bytes)
 * Identification: 0xad0b
 * Flags and Fragments: 0x0000
 * TTL: 0x40 (64 hops)
 * Protocol: 0x11 (UDP)
 * Header Checksum: 0x7272
 * Source: 0xac1402fd (172.20.2.253)
 * Destination: 0xac140006 (172.20.0.6)
 */

/**
 * A 16-bit number
 * 0101111001100001
 *
 * Some interpretations of this number
 * 0101111001100001                 :: As one 16-bit number (24161)
 * 01011110 01100001                :: As two 8-bit numbers (94, 97)
 * 0101 1110 0110 0001              :: As four 4-bit numbers (5, 14, 6, 1)
 * 0 1 0 1 1 1 1 0 0 1 1 0 0 0 0 1  :: As sixteen individual bits
 */

import { readFileSync } from 'fs'
import { uint, sequenceOf, succeed } from '../dist/index.mjs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

const tag = (type) => (value) => ({
  type,
  value,
})

const packetParser = sequenceOf([
  uint(4).map(tag('Version')),
  uint(4).map(tag('IHL')),
  uint(6).map(tag('DSCP')),
  uint(2).map(tag('ECN')),
  uint(16).map(tag('Total Length')),
  uint(16).map(tag('Identification')),
  uint(3).map(tag('Flags')),
  uint(13).map(tag('Fragment Offset')),
  uint(8).map(tag('TTL')),
  uint(8).map(tag('Protocol')),
  uint(16).map(tag('Header Checksum')),
  uint(32).map(tag('Source IP')),
  uint(32).map(tag('Destination IP')),
]).chain((res) => {
  if (res[1].value > 5) {
    const remainingBytes = Array.from({ length: res[1].value - 20 }, () =>
      uint(8)
    )
    return sequenceOf(remainingBytes).chain((remaining) => [
      ...res,
      tag('Options')(remaining),
    ])
  }

  return succeed(res)
})

const __dirname = dirname(fileURLToPath(import.meta.url))
const file = new Uint8Array(readFileSync(path.join(__dirname, './packet.bin')))
  .buffer
const data = new DataView(file)

console.log(packetParser.run(data))
