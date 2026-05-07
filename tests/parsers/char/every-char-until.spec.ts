import { everyCharUntil, str } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('everyCharUntil', () => {
  it('should successfully parse until the marker string is found', () => {
    const parser = everyCharUntil(str('end'))
    const result = parser.run('123end456')

    assertIsOk(result)

    expect(result).toStrictEqual({
      isError: false,
      result: '123', // "123" is before "end"
      index: 3,
    })
  })

  it('should fail if the input stream is fully consumed before the marker is found', () => {
    const parser = everyCharUntil(str('end'))
    const result = parser.run('123456')

    assertIsError(result)
    expect(result).toStrictEqual({
      isError: true,
      error: `ParseError @ index 6 -> everythingUntil: Unexpected end of input`,
      index: 6,
    })
  })

  it('should correctly handle binary data', () => {
    const parser = everyCharUntil(str('end'))
    const result = parser.run(
      new Uint8Array([49, 50, 51, 101, 110, 100, 52, 53, 54])
    ) // equivalent to "123end456"

    assertIsOk(result)
    expect(result).toStrictEqual({
      isError: false,
      result: '123', // "123" is before "end"
      index: 3,
    })
  })

  // The audit (#25) initially flagged byte-by-byte indexing as a UTF-8 hazard.
  // Investigation showed the implementation is correct for valid string
  // inputs because UTF-8 is self-synchronizing: continuation bytes
  // (0x80-0xBF) cannot be confused with start bytes or with ASCII (0x00-0x7F).
  // A marker like `str('é')` ([0xC3, 0xA9]) only matches at a true char
  // boundary, and `decoder.decode` reassembles the collected bytes into a
  // valid UTF-8 string. These tests pin that correctness so it can't
  // regress when #30 (everythingUntil/everyCharUntil semantic refonte) lands.
  describe('UTF-8 correctness on multi-byte chars', () => {
    it('preserves a 2-byte char in the prefix (ASCII marker)', () => {
      const parser = everyCharUntil(str('end'))
      const result = parser.run('héllo end')

      assertIsOk(result)
      expect(result.result).toBe('héllo ')
      // "héllo " = h(1) é(2) l(1) l(1) o(1) ' '(1) = 7 bytes
      expect(result.index).toBe(7)
    })

    it('preserves a 3-byte char (CJK) in the prefix', () => {
      const parser = everyCharUntil(str(','))
      const result = parser.run('日本語,foo')

      assertIsOk(result)
      expect(result.result).toBe('日本語')
      // '日本語' = 3 chars × 3 bytes each = 9 bytes
      expect(result.index).toBe(9)
    })

    it('handles a non-ASCII marker correctly', () => {
      const parser = everyCharUntil(str('€'))
      const result = parser.run('hé€llo')

      assertIsOk(result)
      expect(result.result).toBe('hé')
      // "hé" = h(1) é(2) = 3 bytes; '€' starts at byte 3
      expect(result.index).toBe(3)
    })

    it('handles a multi-byte marker after consecutive multi-byte chars', () => {
      const parser = everyCharUntil(str('!'))
      const result = parser.run('αβγ!δε')

      assertIsOk(result)
      expect(result.result).toBe('αβγ')
      // 'αβγ' = 3 chars × 2 bytes each = 6 bytes
      expect(result.index).toBe(6)
    })

    it('matches a multi-byte marker only at a true char boundary', () => {
      // The marker 'é' is bytes [0xC3, 0xA9]. UTF-8 self-sync guarantees
      // these bytes cannot appear inside another char's encoding, so the
      // match always lands cleanly.
      const parser = everyCharUntil(str('é'))
      const result = parser.run('hellé world')

      assertIsOk(result)
      expect(result.result).toBe('hell')
      expect(result.index).toBe(4)
    })
  })
})
