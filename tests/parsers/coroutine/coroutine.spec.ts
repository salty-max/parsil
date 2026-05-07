import {
  char,
  coroutine,
  digits,
  fail,
  formatParseError,
  letters,
  str,
} from '@parsil'
import { describe, expect, it } from 'bun:test'

import { assertIsError } from '../../util/test-util'

describe('coroutine', () => {
  it('should execute the coroutine and return the final result', () => {
    const parser = coroutine((run) => {
      // Capture some letters and assign them to a variable
      const name = run(letters)

      // Capture a space
      run(char(' '))

      const age = run(digits.map(Number))

      // Capture a space
      run(char(' '))

      if (age >= 18) {
        run(str('is an adult'))
      } else {
        run(str('is a child'))
      }

      return { name, age }
    })

    const input = 'Jim 19 is an adult'
    const result = parser.run(input)
    expect(result).toStrictEqual({
      isError: false,
      result: { name: 'Jim', age: 19 },
      index: 18,
    })
  })

  it('should handle errors thrown in the coroutine', () => {
    const parser = coroutine((run) => {
      run(fail('Error in coroutine'))
      // This line should not be reached
      return 0
    })
    const input = 'test'

    const result = parser.run(input)
    expect(result).toStrictEqual({
      isError: true,
      error: 'Error in coroutine',
      index: 0,
    })
  })

  it('surfaces a non-Parser argument to run as a parse failure', () => {
    // Regression: previously this threw a raw Error out of parser.run,
    // breaking the rule that parsers signal failure via the result
    // envelope, never via exceptions.
    const parser = coroutine((run) => {
      // @ts-expect-error — deliberately misusing run with a non-Parser
      run(42)
      return 0
    })

    const result = parser.run('test')
    assertIsError(result)
    expect(formatParseError(result.error)).toContain('coroutine:')
    expect(formatParseError(result.error)).toContain(
      'must be called with a Parser'
    )
  })

  it('surfaces a non-parser-state thrown value in the body as a parse failure', () => {
    // Regression: previously thrown Error instances would bubble up out
    // of parser.run(...). Now a programming error in the coroutine body
    // is converted to a parse failure with a clear message.
    const parser = coroutine(() => {
      throw new Error('boom')
    })

    const result = parser.run('test')
    assertIsError(result)
    expect(formatParseError(result.error)).toContain('coroutine:')
    expect(formatParseError(result.error)).toContain('boom')
  })
})
