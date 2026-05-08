import {
  forward,
  ParseError,
  parseError,
  Parser,
  ParserState,
  updateError,
  updateState,
} from '@parsil/parser'
import { getNextCharWidth, getUtf8Char } from '@parsil/util'

/**
 * Match a single UTF-8 character that satisfies the given predicate.
 * The foundation primitive on which `oneOf`, `noneOf`, `alphaNum`,
 * `hexDigit`, etc. are built — use it directly when you need an
 * arbitrary character class that the canned helpers don't cover.
 *
 * On failure (predicate returns false, or end of input), emits a
 * `ParseError` with `parser: 'satisfy'`. Pass `label` to substitute
 * a descriptive name for `expected` and the error message — useful
 * when the predicate is opaque.
 *
 * @example
 * const vowel = satisfy((c) => 'aeiouAEIOU'.includes(c), 'vowel')
 * vowel.run('apple')  // result: 'a'
 * vowel.run('xyz')    // ParseError: Expected vowel, but got 'x'
 *
 * @param predicate Function that returns `true` if the character matches.
 * @param label Optional human-readable name for the expected class.
 * @returns A parser that consumes one char if it satisfies `predicate`.
 */
export const satisfy = (
  predicate: (ch: string) => boolean,
  label?: string
): Parser<string> =>
  new Parser((state): ParserState<string, ParseError> => {
    if (state.isError) return forward(state)

    const { index, dataView } = state
    const expected = label ?? 'a character matching the predicate'

    if (index < dataView.byteLength) {
      const charWidth = getNextCharWidth(index, dataView)
      if (index + charWidth <= dataView.byteLength) {
        const char = getUtf8Char(index, charWidth, dataView)
        if (predicate(char)) {
          return updateState(state, index + charWidth, char)
        }
        return updateError(
          state,
          parseError(
            'satisfy',
            index,
            `Expected ${expected}, but got '${char}'`,
            { expected, actual: char }
          )
        )
      }
    }

    return updateError(
      state,
      parseError(
        'satisfy',
        index,
        `Expected ${expected}, but got unexpected end of input`,
        { expected }
      )
    )
  })
