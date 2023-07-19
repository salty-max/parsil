import { Parser } from '../../parser/parser'
import { sequenceOf } from '../sequence-of'

/**
 * Higher-order function that creates a parser that looks for a specific pattern
 * where a piece of data is enclosed by two other pieces of data.
 * It takes two parsers for the left and right boundaries and returns a function that
 * takes another parser for the content between these boundaries.
 * It then applies these parsers in sequence using the `sequenceOf` parser.
 * The result of this function is the result of the content parser.
 *
 * @typeParam L - The result type of the left boundary parser.
 * @typeParam T - The result type of the content parser.
 * @typeParam R - The result type of the right boundary parser.
 *
 * @param leftParser - The parser for the left boundary.
 * @param rightParser - The parser for the right boundary.
 *
 * @returns A function that takes a parser for the content and returns a new parser
 *          that parses a sequence of left boundary, content, and right boundary,
 *          and yields the result of the content parser.
 *
 * @example
 *   // A parser that parses strings enclosed in ""
 *   const stringParser = between(char(`"`), char(`"`))(letters));
 *   const result = stringParser.run(`"HelloWorld"`);
 *   console.log(result.result);  // Prints: "HelloWorld"
 */
export const between =
  <L, T, R>(leftParser: Parser<L>, rightParser: Parser<R>) =>
  (contentParser: Parser<T>): Parser<T> =>
    sequenceOf([leftParser, contentParser, rightParser]).map(([_, c]) => c)
