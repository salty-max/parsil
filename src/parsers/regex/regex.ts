import { Parser, ParserState, updateError, updateState } from '../../parser'
import { encoder, getString } from '../../util'

/**
 * `regex` is a parser that tries to match a given Regular Expression `re` against its input.
 * If the input starts with a string that matches `re`, it consumes the matched characters and
 * returns an `Ok` result with the match as a string and the next position in the input.
 * If there's no match, it returns an `Err` result with an error message and the current position.
 * An error is also thrown if `regex` is not called with a Regular Expression or if the Regular
 * Expression doesn't start with the '^' assertion.
 *
 * @example
 * const parser = regex(/^[a-z]+/)
 * parser.run("abcd123")  // returns { isError: false, result: "abcd", index: 4 }
 * parser.run("123abcd")  // returns { isError: true, error: "ParseError @ index 0 -> regex: Tried to match '/^[a-z]+/', got '123ab...'", index: 0 }
 * regex("abcd")  // throws `regex must be called with a Regular Expression, but got [object String]`
 * regex(/abc/)  // throws `regex parsers must contain '^' start assertion`
 *
 * @param re The Regular Expression to match against the input.
 * @throws {TypeError} If `re` is not a Regular Expression.
 * @throws {Error} If `re` doesn't start with the '^' assertion.
 * @return {Parser<string>} A parser that tries to match the input against `re`.
 */
export const regex = (re: RegExp): Parser<string> => {
  const typeofre = Object.prototype.toString.call(re)
  if (typeofre !== '[object RegExp]') {
    throw new TypeError(
      `regex must be called with a Regular Expression, but got ${typeofre}`
    )
  }

  if (re.toString()[1] !== '^') {
    throw new Error(`regex parsers must contain '^' start assertion`)
  }

  return new Parser<string>((state): ParserState<string, string> => {
    if (state.isError) return state
    const { dataView, index } = state
    const rest = getString(index, dataView.byteLength - index, dataView)

    if (rest.length >= 1) {
      const match = rest.match(re)
      return match
        ? updateState(
            state,
            index + encoder.encode(match[0]).byteLength,
            match[0]
          )
        : updateError(
            state,
            `ParseError @ index ${index} -> regex: Tried to match '${re}', got '${rest.slice(
              0,
              5
            )}...'`
          )
    }

    return updateError(
      state,
      `ParseError @ index ${index} -> regex: Tried to match ${re}, but got unexpected end of input`
    )
  })
}
