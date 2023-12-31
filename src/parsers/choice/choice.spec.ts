import { assertIsError, assertIsOk } from '../../util'
import { digits } from '../digits'
import { letters } from '../letters'
import { choice } from './choice'

describe('choice', () => {
  it('should return result of first successful parser', () => {
    const parser = choice([digits, letters])
    const result = parser.run('foo')

    assertIsOk(result)
    expect(result.result).toBe('foo')
  })

  it('should return error if all parsers fail', () => {
    const parser = choice([digits, letters])
    const result = parser.run('@')

    assertIsError(result)
    expect(result.error).toBe(
      `ParseError @ index 0 -> choice: Unable to match with any parser`
    )
  })
})
