import { InputTypes } from '../input-types'
import { str } from '../parsers/str'
import { assertIsError, assertIsOk } from '../util'
import {
  Parser,
  isError,
  updateState,
  updateResult,
  updateError,
} from './parser'

describe('Parser', () => {
  it('should return Ok when parsing is successful', () => {
    const parser = new Parser((state) => updateResult(state, 'Hello'))
    const result = parser.run('Test input')

    assertIsOk(result)
    expect(result.result).toBe('Hello')
  })

  it('should return Err when parsing fails', () => {
    const parser = new Parser((state) => updateError(state, 'Error occurred'))
    const result = parser.run('Test input')

    assertIsError(result)
    expect(isError(result)).toBe(true)
    expect(result.error).toBe('Error occurred')
  })

  describe('Parser.fork', () => {
    it('should call the success function when parsing is successful', () => {
      const successFn = jest.fn()
      const errorFn = jest.fn()
      const parser = str('foo')

      parser.fork('foo', errorFn, successFn)

      expect(successFn).toHaveBeenCalledWith('foo', expect.anything())
      expect(errorFn).not.toHaveBeenCalled()
    })

    it('should call the error function when parsing fails', () => {
      const successFn = jest.fn()
      const errorFn = jest.fn()
      const parser = str('foo')

      parser.fork('bar', errorFn, successFn)

      expect(errorFn).toHaveBeenCalledWith(
        `ParseError @ index 0 -> str: Tried to match 'foo', but got 'bar...'`,
        expect.anything()
      )
      expect(successFn).not.toHaveBeenCalled()
    })
  })

  it('should update state with new result using map', () => {
    const parser = new Parser((state) => updateResult(state, 'Hello'))
    const mappedParser = parser.map((result) => result + ', World')
    const result = mappedParser.run('Test input')

    assertIsOk(result)
    expect(result.result).toBe('Hello, World')
  })

  it('should update error using errorMap', () => {
    const parser = new Parser((state) => updateError(state, 'Error occurred'))
    const errorMappedParser = parser.errorMap(
      (error) => `Modified ${error.error}`
    )
    const result = errorMappedParser.run('Test input')

    assertIsError(result)
    expect(isError(result)).toBe(true)
    expect(result.error).toBe('Modified Error occurred')
  })
})

describe('updateState', () => {
  it('should return a new state with updated index and result', () => {
    const oldState = {
      dataView: new DataView(new ArrayBuffer(8)),
      inputType: InputTypes.STRING,
      isError: false,
      error: null,
      result: 'old',
      index: 0,
    }

    const newState = updateState(oldState, 2, 'new')

    expect(newState.index).toBe(2)
    expect(newState.result).toBe('new')
  })
})
