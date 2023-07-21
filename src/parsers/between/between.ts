import { Parser } from '../../parser/parser'
import { sequenceOf } from '../sequence-of'

/**
 * `between` is a parser combinator that matches the content between two other parsers, `leftParser` and `rightParser`.
 * It applies the `leftParser` and `rightParser` in sequence and then applies the `contentParser` to match the content in between.
 * It returns the result of the `contentParser` and discards the results of the `leftParser` and `rightParser`.
 *
 * @example
 * const parser = between(str("("), str(")"))(letters)
 * parser.run("(abc)")  // returns "abc"
 * parser.run("(123)")  // returns "ParseError @ index 0 -> between: Expected '('"
 * parser.run("abc")  // returns "ParseError @ index 0 -> between: Expected '('"
 *
 * @template L The type of result that the `leftParser` produces.
 * @template T The type of result that the `contentParser` produces.
 * @template R The type of result that the `rightParser` produces.
 *
 * @param leftParser The parser that matches the left boundary.
 * @param rightParser The parser that matches the right boundary.
 * @param contentParser The parser that matches the content between the left and right boundaries.
 * @returns {Parser<T>} A parser that matches the content between the left and right boundaries.
 */
export const between =
  <L, T, R>(leftParser: Parser<L>, rightParser: Parser<R>) =>
  (contentParser: Parser<T>): Parser<T> =>
    sequenceOf([leftParser, contentParser, rightParser]).map(([_, c]) => c as T)
