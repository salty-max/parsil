import { everythingUntil, str } from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError, assertIsOk } from '../../util/test-util'

describe('everythingUntil', () => {
  it('should successfully parse until the marker string is found', () => {
    const parser = everythingUntil(str('end'))
    const result = parser.run('123end456')

    assertIsOk(result)

    expect(result).toStrictEqual({
      isError: false,
      result: [49, 50, 51], // ASCII codes for "1", "2", "3"
      index: 3,
    })
  })

  it('should fail if the input stream is fully consumed before the marker is found', () => {
    const parser = everythingUntil(str('end'))
    const result = parser.run('123456')

    assertIsError(result)
    expect(result).toStrictEqual({
      isError: true,
      error: expect.objectContaining({
        parser: 'everythingUntil',
        index: 6,
        message: 'Unexpected end of input',
      }),
      index: 6,
    })
  })

  it('should correctly handle binary data', () => {
    const parser = everythingUntil(str('end'))
    const result = parser.run(
      new Uint8Array([49, 50, 51, 101, 110, 100, 52, 53, 54])
    ) // equivalent to "123end456"

    assertIsOk(result)
    expect(result).toStrictEqual({
      isError: false,
      result: [49, 50, 51], // ASCII codes for "1", "2", "3"
      index: 3,
    })
  })

  it('preserves zero bytes in the collected output', () => {
    // Regression: a `if (val) { ... }` guard used to skip bytes whose
    // value was 0x00, silently dropping zero bytes from binary inputs.
    const parser = everythingUntil(str('end'))
    const input = new Uint8Array([0x01, 0x00, 0x02, 0x00, 0x03, 101, 110, 100])
    // Bytes before the 'end' marker: [0x01, 0x00, 0x02, 0x00, 0x03]
    const result = parser.run(input)

    assertIsOk(result)
    expect(result.result).toStrictEqual([0x01, 0x00, 0x02, 0x00, 0x03])
    expect(result.index).toBe(5)
  })

  // Behavior table from #30: byte-level mode exposes raw bytes from
  // any input shape, including UTF-8 continuation bytes when the
  // input was a string with multi-byte chars.
  describe('byte-level semantics on multi-byte input', () => {
    it('collects every byte (including continuation bytes) of multi-byte chars', () => {
      // 'é-end' encodes as [0xC3, 0xA9, 0x2D, 0x65, 0x6E, 0x64].
      // Marker 'end' starts at byte index 3, so prefix bytes are
      // [0xC3, 0xA9, 0x2D].
      const parser = everythingUntil(str('end'))
      const result = parser.run('é-end')

      assertIsOk(result)
      expect(result.result).toStrictEqual([0xc3, 0xa9, 0x2d])
      expect(result.index).toBe(3)
    })

    it('matches encoder.encode(prefix) byte-for-byte', () => {
      const prefix = '日本語'
      const input = `${prefix},foo`
      const parser = everythingUntil(str(','))
      const result = parser.run(input)

      assertIsOk(result)
      const expectedBytes = [...new TextEncoder().encode(prefix)]
      expect(result.result).toStrictEqual(expectedBytes)
      expect(result.index).toBe(expectedBytes.length)
    })
  })

  describe('boundary cases', () => {
    it('returns [] when the marker is at the very start', () => {
      const parser = everythingUntil(str('end'))
      const result = parser.run('end456')

      assertIsOk(result)
      expect(result.result).toStrictEqual([])
      expect(result.index).toBe(0)
    })

    it('returns the full prefix when the marker is at the very end', () => {
      const parser = everythingUntil(str('end'))
      const result = parser.run('123end')

      assertIsOk(result)
      expect(result.result).toStrictEqual([49, 50, 51])
      expect(result.index).toBe(3)
    })

    it('fails on empty input (marker not found)', () => {
      const parser = everythingUntil(str('end'))
      const result = parser.run('')

      assertIsError(result)
      expect(result.error.parser).toBe('everythingUntil')
      expect(result.error.message).toBe('Unexpected end of input')
      expect(result.index).toBe(0)
    })
  })

  // The mode option (#30) lets a single entry point switch between
  // byte- and char-level collection. The default ('bytes') preserves
  // the original semantics; 'chars' yields a UTF-8 string and is the
  // recommended replacement for the deprecated `everyCharUntil`.
  describe("mode: 'chars'", () => {
    it("returns a UTF-8 string when called with mode 'chars'", () => {
      const parser = everythingUntil(str(','), 'chars')
      const result = parser.run('日本語,foo')

      assertIsOk(result)
      expect(result.result).toBe('日本語')
      expect(result.index).toBe(9)
    })

    it("works on UTF-8 buffer input with mode 'chars'", () => {
      const buf = new TextEncoder().encode('héllo,foo')
      const parser = everythingUntil(str(','), 'chars')
      const result = parser.run(buf)

      assertIsOk(result)
      expect(result.result).toBe('héllo')
      expect(result.index).toBe(6)
    })

    it("returns '' when marker is at the very start with mode 'chars'", () => {
      const parser = everythingUntil(str('end'), 'chars')
      const result = parser.run('end456')

      assertIsOk(result)
      expect(result.result).toBe('')
      expect(result.index).toBe(0)
    })

    it("fails with parser:'everythingUntil' on EOI in mode 'chars'", () => {
      const parser = everythingUntil(str('end'), 'chars')
      const result = parser.run('')

      assertIsError(result)
      expect(result.error.parser).toBe('everythingUntil')
      expect(result.error.message).toBe('Unexpected end of input')
    })

    it("explicit mode 'bytes' matches default behavior", () => {
      const a = everythingUntil(str('end')).run('123end')
      const b = everythingUntil(str('end'), 'bytes').run('123end')
      expect(a).toStrictEqual(b)
    })
  })
})
