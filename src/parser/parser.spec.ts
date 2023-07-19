import { sequenceOf } from '../sequence-of'
import { str } from '../str'
import {
  Parser,
  updateParserError,
  updateParserResult,
  updateParserState,
} from './parser'

describe('Parser', () => {
  describe('run', () => {
    it('should initialize the parser state and apply the transformer function', () => {
      const transformer = jest.fn()
      const parser = new Parser(transformer)
      const input = 'foo'

      parser.run(input)

      expect(transformer).toHaveBeenCalledWith({
        target: input,
        index: 0,
        result: null,
        error: null,
        isError: false,
      })
    })
  })

  describe('map', () => {
    it('should return a new Parser that applies a given function to the result', () => {
      const transformer = jest.fn().mockReturnValue({ result: 'foo' })
      const parser = new Parser(transformer).map((res) => `${res}!`)

      const result = parser.run('foo')

      expect(result).toEqual({ result: 'foo!' })
    })
  })
})

describe('updateParserState', () => {
  it('should update the index and result of a given ParserState', () => {
    const oldState = {
      target: 'input',
      index: 0,
      result: 'old',
      error: null,
      isError: false,
    }
    const index = 2
    const result = 'new'

    const newState = updateParserState(oldState, index, result)

    expect(newState).toEqual({
      target: 'input',
      index: 2,
      result: 'new',
      error: null,
      isError: false,
    })
  })
})

describe('updateParserResult', () => {
  it('should update the result of a given ParserState', () => {
    const oldState = {
      target: 'input',
      index: 2,
      result: 'old',
      error: null,
      isError: false,
    }
    const result = 'new'

    const newState = updateParserResult(oldState, result)

    expect(newState).toEqual({
      target: 'input',
      index: 2,
      result: 'new',
      error: null,
      isError: false,
    })
  })
})

describe('updateParserError', () => {
  it('should set the error message and isError flag of a given ParserState', () => {
    const oldState = {
      target: 'input',
      index: 2,
      result: null,
      error: null,
      isError: false,
    }
    const errorMsg = 'Error message'

    const newState = updateParserError(oldState, errorMsg)

    expect(newState).toEqual({
      target: 'input',
      index: 2,
      result: null,
      error: errorMsg,
      isError: true,
    })
  })

  describe('errorMap', () => {
    it('should replace the error message with a custom one', () => {
      const parser = sequenceOf([str('foo'), str('bar')]).errorMap(
        (error, index) => `At index ${index}: ${error}`
      )

      const res = parser.run('foobaz')

      expect(res).toEqual({
        target: 'foobaz',
        index: 3,
        result: ['foo', null],
        isError: true,
        error: "At index 3: str: Tried to match 'bar', but got 'baz'",
      })
    })
  })
})
