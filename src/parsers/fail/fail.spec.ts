import { fail } from './fail'
import { assertIsError } from '../../util'

describe('fail', () => {
  it('should always return error state with the provided error message', () => {
    const errorMsg = 'Error occurred during parsing'
    const errorParser = fail(errorMsg)
    const result = errorParser.run('')

    assertIsError(result)
    expect(result.isError).toBe(true)
    expect(result.error).toBe(errorMsg)
  })
})
