import { Err, Ok, ResultType } from '@parsil/parser'
import { expect } from 'bun:test'

export function assertIsOk<T>(
  result: ResultType<T, string>
): asserts result is Ok<T> {
  expect(result.isError).toBe(false)
}

export function assertIsError<E>(
  result: ResultType<any, E>
): asserts result is Err<E> {
  expect(result.isError).toBe(true)
}
