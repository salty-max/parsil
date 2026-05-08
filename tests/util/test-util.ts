import { Err, Ok, ResultType } from '@parsil/parser'
import { expect } from 'bun:test'

export function assertIsOk<T, E>(
  result: ResultType<T, E>
): asserts result is Ok<T> {
  expect(result.isError).toBe(false)
}

export function assertIsError<T, E>(
  result: ResultType<T, E>
): asserts result is Err<E> {
  expect(result.isError).toBe(true)
}
