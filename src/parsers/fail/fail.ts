import { Parser, updateError } from '../../parser/parser'

/**
 * Creates a Parser that always fails with a given error.
 *
 * @template E The type of the error.
 * @param {E} error The error object to be assigned when the parser fails.
 * @returns {Parser<any, E>} A new Parser instance that always fails with the provided error.
 *
 * @example
 * const errorParser = fail('Error occurred during parsing');
 * const result = errorParser.run('Test input');
 * // result.isError will be true and result.error will be 'Error occurred during parsing'
 */
export function fail<E>(error: E) {
  return new Parser<any, E>((state) => {
    if (state.isError) return state
    return updateError(state, error)
  })
}
