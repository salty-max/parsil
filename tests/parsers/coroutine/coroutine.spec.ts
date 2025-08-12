import { describe, expect, it } from 'bun:test'
import { char, coroutine, digits, fail, letters, str } from '../../../src'

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
})
