import {
  ParseError,
  parseError,
  Parser,
  ParserState,
  updateError,
  updateState,
} from '@parsil/parser'
import { encoder, getString } from '@parsil/util'

const isWordChar = (charCode: number): boolean =>
  (charCode >= 0x30 && charCode <= 0x39) || // 0-9
  (charCode >= 0x41 && charCode <= 0x5a) || // A-Z
  (charCode >= 0x61 && charCode <= 0x7a) || // a-z
  charCode === 0x5f // _

/**
 * Match an exact keyword string, then fail if the byte that immediately
 * follows is a word character (letter, digit, underscore). Prevents
 * partial-prefix matches like `keyword('let').run('letter')` from
 * accidentally consuming part of a longer identifier.
 *
 * Keyword fails cleanly when the input ends right after the match
 * (`keyword('let').run('let')` succeeds — end of input is a valid
 * boundary).
 *
 * @example
 * keyword('let').run('let x = 1')   // result: 'let', index: 3
 * keyword('let').run('letter')      // fails (boundary check)
 * keyword('let').run('let')         // result: 'let' (EOI is a boundary)
 *
 * keyword('Let', { caseSensitive: false }).run('let x') // result: 'let'
 *
 * @param word The keyword to match.
 * @param opts Optional flags.
 * @param opts.caseSensitive Defaults to `true`. When `false`, the keyword
 *   is matched case-insensitively (against ASCII letters only).
 * @returns A parser that yields the matched substring (lowercased copy
 *   when `caseSensitive: false`) on success.
 */
export const keyword = (
  word: string,
  opts: { caseSensitive?: boolean } = {}
): Parser<string> => {
  if (!word) {
    throw new TypeError(
      `keyword must be called with a non-empty string, but got ''`
    )
  }

  const caseSensitive = opts.caseSensitive ?? true
  const target = caseSensitive ? word : word.toLowerCase()
  const targetByteLen = encoder.encode(target).byteLength

  return new Parser<string>((state): ParserState<string, ParseError> => {
    if (state.isError) return state

    const { dataView, index } = state

    // Bounds: the keyword bytes must fit in the remaining input.
    if (dataView.byteLength - index < targetByteLen) {
      return updateError(
        state,
        parseError(
          'keyword',
          index,
          `Expected '${word}', but got unexpected end of input`,
          { expected: word }
        )
      )
    }

    let head = getString(index, targetByteLen, dataView)
    if (!caseSensitive) head = head.toLowerCase()

    if (head !== target) {
      return updateError(
        state,
        parseError(
          'keyword',
          index,
          `Expected '${word}', but got '${head}...'`,
          { expected: word, actual: head }
        )
      )
    }

    // Word-boundary check: if the character right after the match is a
    // word char, this is a partial-prefix match and we reject.
    const nextIndex = index + targetByteLen
    if (nextIndex < dataView.byteLength) {
      const nextByte = dataView.getUint8(nextIndex)
      if (isWordChar(nextByte)) {
        return updateError(
          state,
          parseError(
            'keyword',
            index,
            `Expected '${word}' followed by a word boundary, but got more word characters`,
            { expected: `'${word}' (with word boundary)` }
          )
        )
      }
    }

    return updateState(state, nextIndex, head)
  })
}
