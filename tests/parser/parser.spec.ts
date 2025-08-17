import { assertIsError, assertIsOk } from '../util/test-util'
import {
  InputTypes,
  isError,
  Parser,
  str,
  updateError,
  updateResult,
  updateState,
} from '../../src'
import { describe, expect, it, mock } from 'bun:test'

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
      const successFn = mock()
      const errorFn = mock()
      const parser = str('foo')

      parser.fork('foo', errorFn, successFn)

      expect(successFn).toHaveBeenCalledWith('foo', expect.anything())
      expect(errorFn).not.toHaveBeenCalled()
    })

    it('should call the error function when parsing fails', () => {
      const successFn = mock()
      const errorFn = mock()
      const parser = str('foo')

      parser.fork('bar', errorFn, successFn)

      expect(errorFn).toHaveBeenCalledWith(
        `ParseError @ index 0 -> str: Tried to match 'foo', but got 'bar...'`,
        expect.anything()
      )
      expect(successFn).not.toHaveBeenCalled()
    })
  })

  describe('Parser.skip', () => {
    it('keeps left result and requires right', () => {
      const p = str('foo').skip(str(':'))
      const res = p.run('foo:bar')

      assertIsOk(res)
      expect(res.result).toBe('foo')
      // consumed "foo:" (4 chars)
      expect(res.index).toBe(4)
    })

    it('fails if the right parser fails', () => {
      const p = str('foo').skip(str(':'))
      const res = p.run('foo?bar')

      assertIsError(res)
      // Helpful error starts at the position where ":" was expected
      expect(res.error).toContain(`Tried to match ':'`)
    })
  })

  describe('Parser.then', () => {
    it('discards left and keeps right', () => {
      const p = str('let').then(str(' ')).then(str('x'))
      const res = p.run('let x')

      assertIsOk(res)
      expect(res.result).toBe('x')
      // consumed "let x" (5 chars)
      expect(res.index).toBe(5)
    })

    it('fails if the right parser fails', () => {
      const p = str('let').then(str(' ')).then(str('x'))
      const res = p.run('let y')

      assertIsError(res)
      expect(res.error).toContain(`Tried to match 'x'`)
    })
  })

  describe('Parser.between', () => {
    it('parses between delimiters and keeps the middle', () => {
      const p = str('foo').between(str('('), str(')'))
      const res = p.run('(foo)bar')

      assertIsOk(res)
      expect(res.result).toBe('foo')
      // consumed "(foo)" (5 chars)
      expect(res.index).toBe(5)
    })

    it('fails if the closing delimiter is missing', () => {
      const p = str('foo').between(str('('), str(')'))
      const res = p.run('(foo')

      assertIsError(res)
      expect(res.error).toContain(`Tried to match ')'`)
    })
  })

  describe('Parser.lookahead', () => {
    it('succeeds without consuming input', () => {
      const la = str('foo').lookahead()
      const res = la.run('foobar')

      assertIsOk(res)
      expect(res.result).toBe('foo')
      // lookahead must not advance the index
      expect(res.index).toBe(0)
    })

    it('can be followed by a real consume', () => {
      const la = str('foo').lookahead()
      const consume = str('foo')

      const r1 = la.run('foobar')
      assertIsOk(r1)
      expect(r1.index).toBe(0)

      const r2 = consume.run('foobar')
      assertIsOk(r2)
      expect(r2.index).toBe(3)
    })

    it('fails when the inner parser fails (no consumption)', () => {
      const la = str('foo').lookahead()
      const res = la.run('bar')

      assertIsError(res)
      expect(res.error).toContain(`Tried to match 'foo'`)
      // index should still be at 0 on failure reporting
      expect(res.index).toBe(0)
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
