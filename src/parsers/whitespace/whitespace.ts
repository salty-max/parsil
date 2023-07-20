import { Parser } from '../../parser'
import { regex } from '../regex'

const wsRegex = /^\s+/

/**
 * `whitespace` matches any whitespace character.
 *
 * @example
 * const parser = P.whitespace;
 * parser.run('  \t\n'); // returns { isError: false, result: '  \t\n', index: 4 }
 * parser.run('abc'); // returns { isError: true, error: "ParseError @ index 0 -> regex: Expecting regex match", index: 0 }
 *
 * @returns {Parser<string>} A parser that matches any whitespace character.
 */
export const whitespace: Parser<string> = regex(wsRegex)
