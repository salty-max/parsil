import { Parser } from '../../parser'

/**
 * `recursive` is a parser combinator that allows creating parsers which reference themselves,
 * enabling parsing of recursive constructs. It accepts a function that returns a parser,
 * and when it is invoked, it will call the provided function and run the resulting parser.
 *
 * It's particularly useful when trying to define parsers for nested structures like JSON or HTML,
 * where the exact same structure can recursively appear within itself.
 *
 * @example
 * let arrayParser = recursive(() => sequenceOf([str("["), sepBy(str(","))(valueParser), str("]")]))
 * arrayParser.run("[1,2,[3,4],[5,[6,7]]]")  // returns the nested array structure
 *
 * @template T The type of result that the parser will produce.
 * @template E The type of error that the parser can return.
 *
 * @param parserThunk A function that returns a parser. This is to avoid immediate execution of the parser.
 * @returns {Parser<T, E>} A parser that can parse recursive structures.
 */
export const recursive = <T, E = string>(
  parserThunk: () => Parser<T, E>
): Parser<T, E> =>
  new Parser((state) => {
    return parserThunk().p(state)
  })
