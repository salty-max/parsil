import {
  forward,
  parseError,
  Parser,
  ParserState,
  updateError,
  updateState,
} from '@parsil/parser'

/**
 * Read exactly `n` raw bytes from the input as a `Uint8Array`. The
 * returned slice is a copy decoupled from the underlying buffer.
 *
 * @example
 * const buf = new Uint8Array([1, 2, 3, 4])
 * bytes(3).run(new DataView(buf.buffer)) // result: Uint8Array([1, 2, 3])
 *
 * @param n Number of bytes to read.
 * @returns A parser yielding a fresh `Uint8Array` of length `n`.
 * @throws {TypeError} If `n` is not a non-negative integer.
 */
export const bytes = (n: number): Parser<Uint8Array> => {
  if (!Number.isInteger(n) || n < 0) {
    throw new TypeError(
      `bytes must be called with a non-negative integer, but got ${n}`
    )
  }

  return new Parser(
    (state): ParserState<Uint8Array, ReturnType<typeof parseError>> => {
      if (state.isError) return forward(state)

      const { dataView, index } = state
      if (index + n > dataView.byteLength) {
        return updateError(
          state,
          parseError(
            'bytes',
            index,
            `Tried to read ${n} bytes, but got unexpected end of input`,
            { expected: `${n} bytes` }
          )
        )
      }

      const out = new Uint8Array(
        dataView.buffer.slice(
          dataView.byteOffset + index,
          dataView.byteOffset + index + n
        )
      )
      return updateState(state, index + n, out)
    }
  )
}
