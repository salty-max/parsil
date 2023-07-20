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

import { one, zero, sequenceOf } from '../dist/index.mjs'

const parser = sequenceOf([one, one, one, zero, one, zero, one, zero])

const data = new Uint8Array([234, 235]).buffer
const dataView = new DataView(data)
const res = parser.run(dataView)

console.log(res)
