import { Parser } from '../../parser'
import { decoder } from '../../util'
import { everythingUntil } from '../everything-until'

/**
 * `everyCharUntil` is a higher order parser that parses an input stream until a specific condition, defined by another parser, is met.
 * Unlike `everythingUntil`, this parser converts the collected bytes to a string using a `TextDecoder`.
 *
 * @example
 * const parser = everyCharUntil(str("end"));
 * parser.run("123end456");  // returns "123"
 * parser.run("Hello World");  // returns "Hello World", as "end" is not found
 *
 * @param {Parser<T>} parser - A parser that defines the condition for the end of parsing.
 *
 * @returns {Parser<string>} A parser that consumes the input until the parser parameter returns a successful state.
 */
export const everyCharUntil = <T>(parser: Parser<T>) =>
  everythingUntil(parser).map((results) =>
    decoder.decode(Uint8Array.from(results))
  )
