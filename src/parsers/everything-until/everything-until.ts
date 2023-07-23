import {
  Parser,
  updateError,
  updateResult,
  updateState,
} from '../../parser/parser'

/**
 * `everythingUntil` is a higher-order parser that collects and returns all the values from the input
 * until it encounters an error when running the provided parser.
 *
 * @example
 * const parser = everythingUntil(str("end"));
 * parser.run("123end456");  // returns [49, 50, 51] (ASCII codes for "1", "2", "3")
 * parser.run("123456");  // return `ParseError @ index 6 -> everythingUntil: Unexpected end of input`
 *
 * @template T - The generic parameter representing the type of value the provided parser produces.
 *
 * @param {Parser<T>} parser - The parser that when fails, signals `everythingUntil` to stop collecting values.
 *
 * @returns {Parser<number[], string>} A new parser that will collect and return all parsed values
 * until the provided parser fails.
 */
export const everythingUntil = <T>(parser: Parser<T>): Parser<number[]> =>
  new Parser((state) => {
    if (state.isError) return state

    const results: number[] = []
    let nextState = state

    while (true) {
      const out = parser.p(nextState)

      if (out.isError) {
        const { index, dataView } = nextState

        if (dataView.byteLength <= index) {
          return updateError(
            nextState,
            `ParseError @ index ${index} -> everythingUntil: Unexpected end of input`
          )
        }

        const val = dataView.getUint8(index)
        if (val) {
          results.push(val)
          nextState = updateState(nextState, index + 1, val)
        }
      } else {
        break
      }
    }

    return updateResult(nextState, results)
  })
