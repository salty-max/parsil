import { Parser, ParserState, updateError } from '../../parser'

/**
 * `choice` is a parser combinator that tries each parser in a given list of parsers, in order,
 * until one succeeds. If a parser succeeds, it consumes the relevant input and returns the result.
 * If no parser succeeds, `choice` fails with an error message.
 * An error is also thrown if `choice` is called without a list or with an empty list.
 *
 * @example
 * const parser = choice([str("abc"), str("123")])
 * parser.run("abc123")  // returns "abc"
 * parser.run("123abc")  // returns "123"
 * parser.run("xyz")  // returns "ParseError @ index 0 -> choice: Unable to match with any parser"
 * choice([])  // throws `choice requires a non-empty list of parsers`
 *
 * @param parsers The list of parsers to try in order.
 * @throws {Error} If `parsers` is an empty list.
 * @returns {Parser<any>} A parser that applies the first successful parser in `parsers`.
 */
export function choice<T, E = string>(parsers: Parser<T, E>[]): Parser<T, E>
export function choice<T extends readonly Parser<any, any>[]>(parsers: T): Parser<T[number] extends Parser<infer R, any> ? R : never, T[number] extends Parser<any, infer Err> ? Err : never>
export function choice<T extends Parser<any, any>[]>(
  parsers: T
) {
  if (parsers.length === 0) {
    throw new Error('choice requires a non-empty list of parsers');
  }

  if (parsers.length === 1) {
    return parsers[0] as Parser<T[number] extends Parser<infer U> ? U : never>
  }

  return new Parser((state) => {
    if (state.isError) return state;

    for (const p of parsers) {
      const out = p.p(state);
      if (!out.isError) return out as ParserState<T[number] extends Parser<infer U> ? U : never, string>;
    }

    return updateError(
      state,
      `ParseError @ index ${state.index} -> choice: Unable to match with any parser`
    );
  });
}
