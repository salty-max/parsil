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
})
