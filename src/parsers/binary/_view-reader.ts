import {
  parseError,
  Parser,
  ParserState,
  updateError,
  updateState,
} from '@parsil/parser'

/**
 * Internal helper: build a fixed-width binary parser that reads `n`
 * bytes from the underlying `DataView` via `read(dataView, offset)`.
 * Emits a structured `ParseError` on EOI.
 *
 * Not part of the public API.
 *
 * @param name Parser identifier surfaced in `ParseError.parser`.
 * @param byteLength Number of bytes consumed on success.
 * @param read Callback invoked with the underlying `DataView` and offset.
 * @returns A `Parser<T>` that consumes `byteLength` bytes.
 */
export const viewReader = <T>(
  name: string,
  byteLength: number,
  read: (dataView: DataView, offset: number) => T
): Parser<T> =>
  new Parser((state): ParserState<T, ReturnType<typeof parseError>> => {
    if (state.isError) return state

    const { dataView, index } = state
    if (index + byteLength > dataView.byteLength) {
      return updateError(
        state,
        parseError(
          name,
          index,
          `Tried to read ${byteLength} byte${byteLength === 1 ? '' : 's'}, but got unexpected end of input`,
          { expected: `${byteLength} byte${byteLength === 1 ? '' : 's'}` }
        )
      )
    }

    return updateState(state, index + byteLength, read(dataView, index))
  })
